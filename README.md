# PaperCut

PaperCut provides simple offline paper wallet tools for Solana. It's a minimal, browser-based set of pages that help you generate, store, and use Solana keys without relying on external servers.
>[!CAUTION]
>Safety notice: Never generate or use real (mainnet) private keys while connected to the internet. This project is provided "as-is" and is intended for experimentation and education. Audit and use at your own risk.

---

## Quick links

- Demo / pages branch (for testing): https://github.com/no-development-group/PaperCut/tree/pages
- Creation tools: `creation/paper.html` (generate keys offline)
- Usage tools: `use/paper-use.html` (construct & sign transactions using your generated keys)

---

## How to test it (offline)

1. Clone or download the repository.
2. Open `creation/paper.html` in a browser while offline (open the file directly from disk).
3. Follow the page instructions to generate a new wallet. You can then print the pdf provided.
4. Fund the wallet on Devnet before using it in any real interaction (e.g., send ~5 SOL on Devnet so the wallet is not unfunded).
5. To create and sign a transaction, open `use/paper-use.html` and import your keys.

Note: The pages are intentionally minimal and self-contained; they do not require a server.

---

## How it works (short)

- `creation/` contains tools to generate keypairs and display/print paper wallets offline.
- `use/` contains tools send and review transactions.

Keep everything offline when you generate or store real keys.

---

## Contributing

Feel free to audit, fork, or submit improvements. If you use parts of this project, a star on the repository is appreciated.

---

## License

MPL - V2
