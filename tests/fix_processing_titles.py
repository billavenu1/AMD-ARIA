"""
One-time script to fix existing sources that have 'Processing...' as title.
Derives the title from the asset file_path or url.

Usage:
    python tests/fix_processing_titles.py
"""

import os
import json
import requests

API_BASE = os.getenv("API_BASE", "http://localhost:5055/api")


def main():
    print("Fixing sources with 'Processing...' title...\n")

    # Get all notebooks
    notebooks = requests.get(f"{API_BASE}/notebooks").json()

    fixed = 0
    for nb in notebooks:
        nb_id = nb["id"]
        sources = requests.get(f"{API_BASE}/sources", params={"notebook_id": nb_id}).json()

        for src in sources:
            if src["title"] == "Processing..." or not src["title"]:
                new_title = None

                # Derive title from asset
                asset = src.get("asset") or {}
                if asset.get("file_path"):
                    new_title = os.path.basename(asset["file_path"])
                elif asset.get("url"):
                    new_title = asset["url"]

                if new_title and new_title != src["title"]:
                    print(f"  Fixing: {src['id']}")
                    print(f"    Old title: '{src['title']}'")
                    print(f"    New title: '{new_title}'")

                    resp = requests.put(
                        f"{API_BASE}/sources/{src['id']}",
                        json={"title": new_title},
                    )
                    if resp.status_code == 200:
                        print(f"    [OK] Updated")
                        fixed += 1
                    else:
                        print(f"    [FAIL] Failed: {resp.status_code} {resp.text}")
                else:
                    print(f"  Skipping {src['id']} — no asset info to derive title from")

    print(f"\nDone. Fixed {fixed} source(s).")


if __name__ == "__main__":
    main()
