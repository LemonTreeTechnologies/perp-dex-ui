let
  pkgs = import <nixpkgs> { };
in
pkgs.mkShell {
  packages = with pkgs; [
    nodejs_22
    corepack_22
    typeshare
  ];
  nativeBuildInputs =
    with pkgs;
    [
      # Rust toolchain
      cargo
      pkg-config
    ];
  buildInputs =
    with pkgs;
    [ 
    ]
    ++ lib.optionals stdenv.hostPlatform.isLinux [
      # Required for most applications
    ]
    ++ lib.optionals stdenv.hostPlatform.isDarwin [
    ];
  
}
