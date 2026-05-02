import os
import glob

# For all .yml files in .github/workflows
for filepath in glob.glob(".github/workflows/*.yml"):
    with open(filepath, "r") as f:
        content = f.read()

    # Need to make sure both tokens are handled correctly
    if "anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY || secrets.CLAUDE_CODE_OAUTH_TOKEN }}" in content:
        content = content.replace("anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY || secrets.CLAUDE_CODE_OAUTH_TOKEN }}",
                                  "anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}")

    # We must provide anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }} AND claude_code_oauth_token: ${{ secrets.CLAUDE_CODE_OAUTH_TOKEN }}
    # But since the previous CI run complained that BOTH were missing or invalid (because empty string)
    # The action might fail if we pass an empty string for the API key and expect it to fallback.
    # The correct way is probably to use only the one that is present, or pass them both as they are.

    with open(filepath, "w") as f:
        f.write(content)

    print(f"Updated {filepath}")
