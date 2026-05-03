import os
import glob

# For all .yml files in .github/workflows
for filepath in [".github/workflows/claude-code-review.yml", ".github/workflows/claude.yml"]:
    with open(filepath, "r") as f:
        content = f.read()

    # Step level if condition
    if "uses: anthropics/claude-code-action" in content:
        lines = content.split('\n')
        for i, line in enumerate(lines):
            if "uses: anthropics/claude-code-action" in line:
                # The issue is we injected `if: env.ANTHROPIC_API_KEY ...` but `env.ANTHROPIC_API_KEY` is not populated
                # unless we export it at a higher level. Or it's actually `secrets.ANTHROPIC_API_KEY != ''`
                # Since we are passing them in `with:`, they are evaluated inside the action.

                # We can add an `if:` to the step using the secret directly in the `env` context
                # To do that, we add an `env` to the step with the secrets, then use `env.XXX` in `if`
                pass

        # Actually `if: ${{ secrets.ANTHROPIC_API_KEY != '' }}` works at the step level!
        for i in range(len(lines)):
            if lines[i].strip().startswith("uses: anthropics/claude-code-action"):
                indent = lines[i][:len(lines[i]) - len(lines[i].lstrip())]
                lines.insert(i, f"{indent}if: ${{{{ env.ANTHROPIC_API_KEY != '' || env.CLAUDE_CODE_OAUTH_TOKEN != '' }}}}")
                lines.insert(i, f"{indent}env:")
                lines.insert(i+1, f"{indent}  ANTHROPIC_API_KEY: ${{{{ secrets.ANTHROPIC_API_KEY }}}}")
                lines.insert(i+2, f"{indent}  CLAUDE_CODE_OAUTH_TOKEN: ${{{{ secrets.CLAUDE_CODE_OAUTH_TOKEN }}}}")
                break

    with open(filepath, "w") as f:
        f.write('\n'.join(lines))

    print(f"Updated {filepath}")
