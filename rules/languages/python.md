# Python Rules

Python-specific coding guidelines. Apply alongside the common rules.

## Style & Formatting

- Follow **PEP 8** for code style — enforce with a linter
- Use **Black** for auto-formatting and **Ruff** or **flake8** for linting
- Use **isort** (or Ruff's built-in) for consistent import ordering
- Maximum line length: 88 characters (Black default) or 120 if team prefers

## Type Hints

- Add **type hints to all public functions** (parameters and return types)
- Use `from __future__ import annotations` for modern annotation syntax
- Use `typing` module types: `Optional`, `Union`, `Sequence`, `Mapping`
- Run **mypy** or **pyright** in strict mode in CI

```python
# Good
def get_user(user_id: int) -> User | None:
    ...

# Avoid
def get_user(user_id):
    ...
```

## Data Models

- Use **dataclasses** for simple data containers
- Use **Pydantic** for data validation, serialization, and API schemas
- Prefer `@dataclass(frozen=True)` for immutable data
- Use `NamedTuple` for lightweight immutable records

## String Formatting

- Use **f-strings** for string interpolation — they're the fastest and most readable
- Avoid `.format()` and `%` formatting in new code
- Use `textwrap.dedent` for multi-line strings in code

## Resource Management

- Use **context managers** (`with` statements) for all resources (files, connections, locks)
- Implement `__enter__`/`__exit__` or use `@contextmanager` for custom resources
- Never leave file handles, database connections, or sockets open

```python
# Good
with open("data.txt") as f:
    content = f.read()

# Avoid
f = open("data.txt")
content = f.read()
f.close()
```

## Environment & Dependencies

- **Always use virtual environments** (`venv`, `poetry`, `uv`)
- Pin dependency versions in `requirements.txt` or `pyproject.toml`
- Use `pyproject.toml` as the single source for project metadata
- Specify the minimum Python version your project supports

## Error Handling

- Catch **specific exceptions**, never bare `except:` or `except Exception:`
- Use custom exception classes inheriting from appropriate base classes
- Use `raise ... from err` to preserve exception chains
- Let unexpected exceptions propagate — don't catch what you can't handle

## Project Structure

- Use `src/` layout for packages intended for distribution
- Keep `__init__.py` files minimal — avoid heavy imports
- Separate CLI entry points from library code
- Use `if __name__ == "__main__":` for script entry points

## Testing

- Use **pytest** as the test framework — it's the standard
- Use `pytest.mark.parametrize` for data-driven tests
- Use **fixtures** for setup/teardown and dependency injection
- Place tests in a `tests/` directory mirroring the `src/` structure
