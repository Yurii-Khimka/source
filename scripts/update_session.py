#!/usr/bin/env python3
"""Update docs/SESSION_STATE.md with completed tasks, notes, bugs, and fixes."""

import argparse
import re
from datetime import date
from pathlib import Path

SESSION_FILE = Path(__file__).parent.parent / "docs" / "SESSION_STATE.md"
TODAY = date.today().isoformat()


def read_file() -> str:
    return SESSION_FILE.read_text(encoding="utf-8")


def write_file(content: str) -> None:
    SESSION_FILE.write_text(content, encoding="utf-8")
    print("SESSION_STATE updated")


def update_last_updated(content: str) -> str:
    return re.sub(
        r"\*\*Last updated:\*\* \d{4}-\d{2}-\d{2}",
        f"**Last updated:** {TODAY}",
        content,
    )


def append_to_section(content: str, section: str, entry: str) -> str:
    """Append an entry to the end of a markdown section (## heading)."""
    pattern = rf"(## {re.escape(section)}\n)(.*?)(\n## |\Z)"
    match = re.search(pattern, content, re.DOTALL)
    if not match:
        # Section not found — append it at the end
        content = content.rstrip() + f"\n\n## {section}\n{entry}\n"
        return content

    section_header = match.group(1)
    section_body = match.group(2).rstrip()
    rest = match.group(3)

    new_section = f"{section_header}{section_body}\n{entry}\n{rest}"
    return content[: match.start()] + new_section + content[match.end() :]


def remove_from_section(content: str, section: str, text: str) -> str:
    """Remove a line containing `text` from a section."""
    lines = content.split("\n")
    in_section = False
    result = []
    for line in lines:
        if line.startswith(f"## {section}"):
            in_section = True
        elif line.startswith("## "):
            in_section = False
        if in_section and text.lower() in line.lower():
            continue
        result.append(line)
    return "\n".join(result)


def main() -> None:
    parser = argparse.ArgumentParser(description="Update SESSION_STATE.md")
    parser.add_argument("--completed", help="Add to Completed section")
    parser.add_argument("--note", help="Add to Today's Log section")
    parser.add_argument("--bug", help="Add to Known Bugs section")
    parser.add_argument("--fixed", help="Remove from Known Bugs, add to log")
    args = parser.parse_args()

    if not any([args.completed, args.note, args.bug, args.fixed]):
        parser.print_help()
        return

    content = read_file()
    content = update_last_updated(content)

    if args.completed:
        entry = f"- [{TODAY}] {args.completed}"
        content = append_to_section(content, "Completed", entry)

    if args.note:
        entry = f"- [{TODAY}] {args.note}"
        content = append_to_section(content, "In Progress", entry)

    if args.bug:
        entry = f"- {args.bug}"
        content = append_to_section(content, "Known Bugs", entry)

    if args.fixed:
        content = remove_from_section(content, "Known Bugs", args.fixed)
        entry = f"- [{TODAY}] Fixed: {args.fixed}"
        content = append_to_section(content, "Completed", entry)

    write_file(content)


if __name__ == "__main__":
    main()
