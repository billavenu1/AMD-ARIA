import os
import glob

# For all .yml files in .github/workflows
for filepath in glob.glob(".github/workflows/*.yml"):
    with open(filepath, "r") as f:
        content = f.read()

    # The claude review needs to be skipped if neither token is provided
    # The previous attempt probably didn't replace correctly or the Github Action itself failed.
    # What's failing is still: "Either ANTHROPIC_API_KEY or CLAUDE_CODE_OAUTH_TOKEN is required"
    # This means the action gets executed but both are empty.

    # We should add a condition to the step itself
    if "uses: anthropics/claude-code-action" in content:
        lines = content.split('\n')
        for i, line in enumerate(lines):
            if "uses: anthropics/claude-code-action" in line:
                # Need to inject an 'if' condition on the step
                # Step start is usually 'name: Run Claude Code' or similar
                # Let's find the 'name:' above this
                step_start = i
                while step_start >= 0 and not lines[step_start].strip().startswith("- name:"):
                    step_start -= 1

                if step_start >= 0:
                    indent = lines[step_start][:len(lines[step_start]) - len(lines[step_start].lstrip())]
                    lines.insert(step_start + 1, f"{indent}  if: env.ANTHROPIC_API_KEY != '' || env.CLAUDE_CODE_OAUTH_TOKEN != ''")

        with open(filepath, "w") as f:
            f.write('\n'.join(lines))
        print(f"Updated {filepath}")
