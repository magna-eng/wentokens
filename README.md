# wentokens

## Installing, Building, and Testing
First, [install foundry](https://book.getfoundry.sh/getting-started/installation) and make sure you have the latest version.

To initialize the repo, run:
```bash
forge install
```

To build the project, run:
```bash
forge build
```

To (build and) run tests, run:
```bash
forge test -vvv
```

To (build and) run tests and generate a gas report, run:
```bash
forge test --gas-report
```

Note: At least level 2 verbosity (`-vv`) is required to see `console.log` statements inside tests.

# Note:
If your `forge build` command fails with an error related to `build` not being a valid subcommand, this may be due to you already having `@arcblock/forge-cli` from the Solana development environment here.

To fix this:
```
npm uninstall -g @arcblock/forge-cli
sudo rm -rf /opt/homebrew/bin/forge
```
