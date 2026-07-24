"""
main.py — entry-point alias for Vision Agents compatibility.

Some shell environments and the Vision Agents internal process spawner
look for `main.py` as the default script name.  This file simply
re-exports everything from agent.py so both of these work:

    uv run agent.py run
    uv run main.py  run
"""
from agent import runner  # re-export so `uv run main.py run|serve` works

if __name__ == "__main__":
    runner.cli()
