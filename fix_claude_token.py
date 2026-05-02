import os
import glob

# For all .yml files in .github/workflows
for filepath in glob.glob(".github/workflows/*.yml"):
    with open(filepath, "r") as f:
        content = f.read()

    # Need to make sure both tokens are handled correctly
    if "anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}" in content:
        # Add claude_code_oauth_token manually if it was deleted
        if "claude_code_oauth_token" not in content:
            content = content.replace("anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}",
                                      "anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}\n          claude_code_oauth_token: ${{ secrets.CLAUDE_CODE_OAUTH_TOKEN }}")

        # Check if the secret is passed via env, which might be required by the action itself.
        # Actually the error says "Environment variable validation failed: Either ANTHROPIC_API_KEY or CLAUDE_CODE_OAUTH_TOKEN is required"
        # It seems the ACTION itself requires it passed through env maybe?
        # But wait, looking at the inputs to the action: `anthropic_api_key: ""`
        # This implies `secrets.ANTHROPIC_API_KEY` is literally empty.

        # If it's empty, we must find a way to let it know not to fail or provide a dummy one if it is missing
        # BUT this is a third-party Github action, if the user doesn't have the secret, it fails.
        # So we should only run the job if the secret is available!

    with open(filepath, "w") as f:
        f.write(content)

    print(f"Updated {filepath}")
