{
  description = "Notes CRUD demo - Rust backend + React frontend";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-24.11";
    flake-utils.url = "github:numtide/flake-utils";
    rust-overlay = {
      url = "github:oxalica/rust-overlay";
      inputs.nixpkgs.follows = "nixpkgs";
    };
  };

  outputs = { nixpkgs, flake-utils, rust-overlay, ... }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        overlays = [ (import rust-overlay) ];
        pkgs = import nixpkgs { inherit system overlays; };
        rustToolchain = pkgs.rust-bin.stable.latest.default.override {
          extensions = [ "rust-src" "rust-analyzer" "clippy" "rustfmt" ];
        };
      in {
        devShells.default = pkgs.mkShell {
          buildInputs = with pkgs; [
            rustToolchain
            sqlx-cli
            nodejs_20
            nodePackages.pnpm
            sqlite
            pkg-config
            openssl
          ];
          shellHook = ''
            echo "Notes demo shell"
            echo "  Rust:    $(rustc --version)"
            echo "  Node:    $(node --version)"
            echo "  pnpm:    $(pnpm --version)"
          '';
        };
      });
}
