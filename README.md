# 🔭 cng - run commands on file ChaNGes

> Run commands on file change using glob patterns, heavily inspired by the excellent [onchange][onchange], but written in Go.

## Install

Download a [release](https://github.com/danawoodman/cng/releases) for your platform and add it to your path.

Or just install with Golang:

```shell
go install github.com/danawoodman/cng
```

## Usage

```shell
# Run `go run ./cmd/myapp` when any .go or .html files change.
# `-i` runs the command once initially, without any event
# `-k`` kills running processes between changes
# The command you want to run is followed by the `--` separator:
cng -ik '**/*.go' 'templates/**/*.html' -- go run ./cmd/myapp

# Run tests when your source or tests change:
cng 'app/**/*.{ts,tsx}' '**/*.test.ts' -- npm test

# Wait 500ms before running the command:
cng -d 500 '*.md' -- echo "changed!"

# Ignore/exclude some paths:
cng -e 'path/to/exclude/*.go' '**/*.go' -- echo "changed!"
```

## Features

- Watch for changes using global patterns like `'*.go'` or `'src/**/*.jsx?'` (using [doublestar][doublestar], which is a much more flexible option than Go's built in glob matching). Watching is done using the very fast [fsnotify][fsnotify] library.
- Run any command you want, like `go run ./cmd/myapp` or `npm test`
- Optionally kill running processes between changes, useful for when running web servers for example. Importantly, cng kills all child processes as well, so your ports get properly freed between runs (avoids errors like `"bind: address already in use"`)
- Optionally run the task immediately or only run when a change is detected (default)
- Pass in a delay to wait between re-runs. If a change is detected in the delay window, the command will not be re-run. This is useful for when you're making a lot of changes at once and don't want to run the command for each change.
- Optionally exclude paths from triggering the command

## Options

```
$ cng
Runs a command when file changes are detected

Usage:
  cng [flags] [paths] -- [command]

Flags:
  -a, --add               execute command for initially added paths
  -d, --delay int         delay between process changes in milliseconds
  -e, --exclude strings   exclude matching paths
  -h, --help              help for cng
  -i, --initial           execute command once on load without any event
  -k, --kill              kill running processes between changes
  -v, --verbose           enable verbose logging
```

## Notes and Limitations

Currently, cng only supports a subset of the onchange commands, but I'm open to adding more. Please open an issue if you have a feature request.

This is a very new project and hasn't been tested really anywhere outside of my machine (macOS), if you run into any issues, please open an issue!

No test suite as of yet, but I aspire to add one 😇.

## Motivations

Mostly, this project was an excuse to play more with Go, but also I wanted a more portable version of onchange.

I also couldn't find the tool I wanted in the Go (or broader) ecosystem that was a portable binary. I tried out [air][air], [gow][gow], [Task][task] and others but none of them really fit my needs (still great tools tho!). For me, air didn't work well when I tried it with `go run`. `gow` does work with `go run` but it's not generic enough to use outside of go projects. `Task` is a cool modern alternative to make but I also could get it working well with `go run` and killing my web server processes (and associated port binding).

I loved onchange but the combo of requiring Node, not being maintained anymore, and not being a portable binary was a deal breaker for me (well that and I just wanted to try and make it myself in Go 😅).

## Development

PRs welcome!

We use Cobra to parse command line arguments.

```shell
# Build the CLI
make build

# Run tests once
make test
make test-unit
make test-e2e

# Run tests in watch mode
make watch-test
make watch-unit-test
make watch-e2e-test

# Install the CLI locally
make install

# Reinstall the CLI after making changes:
make watch-install
```

## License

MIT

## Credits

Written by [Dana Woodman](https://danawoodman.com) with heavy inspiration from [onchange][onchange].

[onchange]: https://github.com/Qard/onchange
[air]: https://github.com/cosmtrek/air
[gow]: https://github.com/mitranim/gow
[task]: https://github.com/go-task/task
[doublestar]: https://github.com/bmatcuk/doublestar
[fsnotify]: https://github.com/fsnotify/fsnotify
