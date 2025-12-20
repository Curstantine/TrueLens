{
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs =
    {
      self,
      nixpkgs,
      flake-utils,
    }:
    flake-utils.lib.eachDefaultSystem (
      system:
      let
        pkgs = import nixpkgs {
          inherit system;
        };

        # Dependencies required at run-time.
        buildInputs = with pkgs; [
          nodejs_22
          corepack
          prisma-engines
          prisma
        ];

        # Dependencies required at build-time.
        nativeBuildInputs = with pkgs; [ ];
      in
      {
        # Development shell with: nix develop
        devShells.default = pkgs.mkShell {
          buildInputs = with pkgs; [ nodePackages.vercel ] ++ buildInputs ++ nativeBuildInputs;
          shellHook = ''
            export PKG_CONFIG_PATH="${pkgs.openssl.dev}/lib/pkgconfig";
            export PRISMA_SCHEMA_ENGINE_BINARY="${pkgs.prisma-engines}/bin/schema-engine"
            export PRISMA_QUERY_ENGINE_BINARY="${pkgs.prisma-engines}/bin/query-engine"
            export PRISMA_QUERY_ENGINE_LIBRARY="${pkgs.prisma-engines}/lib/libquery_engine.node"
            export PRISMA_FMT_BINARY="${pkgs.prisma-engines}/bin/prisma-fmt"
          '';
        };
      }
    );
}

