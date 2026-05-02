"""
Test script to verify source file names are correctly stored and retrieved.

Usage:
    python tests/test_source_names.py

Prerequisites:
    - API server running on http://localhost:5055
    - SurrealDB running
    - At least one notebook/project created
"""

import os
import sys
import json
import tempfile
import requests

API_BASE = os.getenv("API_BASE", "http://localhost:5055/api")


def get_notebooks():
    """Fetch all notebooks/projects."""
    resp = requests.get(f"{API_BASE}/notebooks")
    resp.raise_for_status()
    return resp.json()


def get_sources(notebook_id: str):
    """Fetch sources for a given notebook."""
    resp = requests.get(f"{API_BASE}/sources", params={"notebook_id": notebook_id})
    resp.raise_for_status()
    return resp.json()


def upload_source(notebook_id: str, filepath: str, expected_title: str | None = None):
    """Upload a file as a source and return the response."""
    filename = os.path.basename(filepath)
    title = expected_title or filename

    with open(filepath, "rb") as f:
        resp = requests.post(
            f"{API_BASE}/sources",
            files={"file": (filename, f)},
            data={
                "type": "upload",
                "notebooks": json.dumps([notebook_id]),
                "title": title,
                "async_processing": "true",
            },
        )
    resp.raise_for_status()
    return resp.json()


def add_link_source(notebook_id: str, url: str, title: str | None = None):
    """Add a URL as a source."""
    resp = requests.post(
        f"{API_BASE}/sources",
        data={
            "type": "link",
            "notebooks": json.dumps([notebook_id]),
            "url": url,
            "title": title or url,
            "async_processing": "true",
        },
    )
    resp.raise_for_status()
    return resp.json()


def delete_source(source_id: str):
    """Delete a source by ID."""
    resp = requests.delete(f"{API_BASE}/sources/{source_id}")
    resp.raise_for_status()


# ---------------------------------------------------------------------------
# Test cases
# ---------------------------------------------------------------------------


def test_upload_preserves_filename():
    """Test that uploaded file's title matches the filename."""
    notebooks = get_notebooks()
    assert len(notebooks) > 0, "No notebooks found. Create a project first."
    nb = notebooks[0]
    nb_id = nb["id"]

    print(f"\n[TEST] Upload preserves filename")
    print(f"  Using notebook: {nb['name']} ({nb_id})")

    # Create a temp file with a recognizable name
    tmpdir = tempfile.mkdtemp()
    test_filename = "my_test_document_12345.txt"
    test_filepath = os.path.join(tmpdir, test_filename)
    with open(test_filepath, "w") as f:
        f.write("This is test content for source name verification.\n" * 10)

    try:
        result = upload_source(nb_id, test_filepath)
        assert result["title"] == test_filename, (
            f"FAIL: Expected title '{test_filename}', got '{result['title']}'"
        )
        print(f"  ✅ Title is correct: '{result['title']}'")
        print(f"  Source ID: {result['id']}")

        # Verify it appears in the sources list
        sources = get_sources(nb_id)
        matching = [s for s in sources if s["id"] == result["id"]]
        assert len(matching) == 1, f"Source not found in list for notebook {nb_id}"
        assert matching[0]["title"] == test_filename, (
            f"FAIL: List title mismatch. Expected '{test_filename}', got '{matching[0]['title']}'"
        )
        print(f"  ✅ Source appears in list with correct title")

        # Cleanup
        delete_source(result["id"])
        print(f"  ✅ Cleaned up test source")

    finally:
        os.unlink(test_filepath)
        os.rmdir(tmpdir)


def test_link_preserves_title():
    """Test that link sources use the provided title."""
    notebooks = get_notebooks()
    assert len(notebooks) > 0, "No notebooks found."
    nb = notebooks[0]
    nb_id = nb["id"]

    print(f"\n[TEST] Link preserves title")
    print(f"  Using notebook: {nb['name']} ({nb_id})")

    test_url = "https://example.com/test-document"
    test_title = "Example Test Document"

    result = add_link_source(nb_id, test_url, test_title)
    assert result["title"] == test_title, (
        f"FAIL: Expected title '{test_title}', got '{result['title']}'"
    )
    print(f"  ✅ Title is correct: '{result['title']}'")

    # Verify in list
    sources = get_sources(nb_id)
    matching = [s for s in sources if s["id"] == result["id"]]
    assert len(matching) == 1, "Source not found in list"
    assert matching[0]["title"] == test_title
    print(f"  ✅ Source appears in list with correct title")

    # Cleanup
    delete_source(result["id"])
    print(f"  ✅ Cleaned up test source")


def test_sources_list_not_empty_after_upload():
    """Test that sources list is not empty after uploading a file."""
    notebooks = get_notebooks()
    assert len(notebooks) > 0, "No notebooks found."
    nb = notebooks[0]
    nb_id = nb["id"]

    print(f"\n[TEST] Sources list reflects uploads")
    print(f"  Using notebook: {nb['name']} ({nb_id})")

    before = get_sources(nb_id)
    before_count = len(before)
    print(f"  Sources before: {before_count}")

    # Upload a test file
    tmpdir = tempfile.mkdtemp()
    test_filepath = os.path.join(tmpdir, "count_test.txt")
    with open(test_filepath, "w") as f:
        f.write("test content")

    try:
        result = upload_source(nb_id, test_filepath)
        after = get_sources(nb_id)
        after_count = len(after)
        print(f"  Sources after: {after_count}")

        assert after_count == before_count + 1, (
            f"FAIL: Expected {before_count + 1} sources, got {after_count}"
        )
        print(f"  ✅ Source count incremented correctly")

        # Cleanup
        delete_source(result["id"])

    finally:
        os.unlink(test_filepath)
        os.rmdir(tmpdir)


def test_list_all_source_names():
    """Print all sources for each notebook - useful for debugging."""
    print(f"\n[INFO] Listing all source names across all notebooks")
    notebooks = get_notebooks()

    if not notebooks:
        print("  No notebooks found.")
        return

    for nb in notebooks:
        nb_id = nb["id"]
        sources = get_sources(nb_id)
        print(f"\n  [DIR] {nb['name']} ({nb_id}) - {len(sources)} source(s)")
        for src in sources:
            status = src.get("status") or "done"
            asset = src.get("asset") or {}
            file_path = asset.get("file_path", "")
            url = asset.get("url", "")
            origin = file_path or url or "n/a"
            print(f"    • [{status:>10}] {src['title']}")
            print(f"                  id={src['id']}, origin={origin}")


# ---------------------------------------------------------------------------
# Run
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    print("=" * 60)
    print("ARIA Source Name Test Suite")
    print(f"API: {API_BASE}")
    print("=" * 60)

    # Check API is up
    try:
        requests.get(f"{API_BASE.rstrip('/api')}/health", timeout=5)
    except Exception:
        print("\n[ERROR] Cannot reach API. Is the server running on localhost:5055?")
        sys.exit(1)

    passed = 0
    failed = 0
    tests = [
        test_list_all_source_names,
        test_upload_preserves_filename,
        test_link_preserves_title,
        test_sources_list_not_empty_after_upload,
    ]

    for test_fn in tests:
        try:
            test_fn()
            passed += 1
        except AssertionError as e:
            print(f"  [FAIL] {e}")
            failed += 1
        except Exception as e:
            print(f"  [ERROR] Unexpected error: {e}")
            failed += 1

    print("\n" + "=" * 60)
    print(f"Results: {passed} passed, {failed} failed")
    print("=" * 60)
    sys.exit(1 if failed else 0)
