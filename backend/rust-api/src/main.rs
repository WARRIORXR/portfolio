//! Gateway entrypoint.

use std::net::SocketAddr;

use tokio::net::TcpListener;
use tracing_subscriber::EnvFilter;

use rust_api::{AppState, Config, build_router};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    tracing_subscriber::fmt()
        .with_env_filter(
            EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| EnvFilter::new("rust_api=info,tower_http=info")),
        )
        .init();

    let config = Config::from_env();
    let bind_addr = config.bind_addr;
    let python_url = config.python_url.clone();
    let static_dir = config.static_dir.clone();
    let github_user = config.github_username.clone();

    let state = AppState::new(config).map_err(|error| {
        tracing::error!(%error, "gateway configuration is unusable");
        std::io::Error::other(error.to_string())
    })?;

    let app = build_router(state);

    let listener = TcpListener::bind(bind_addr).await?;
    tracing::info!(
        address = %listener.local_addr()?,
        %python_url,
        static_dir = %static_dir.display(),
        %github_user,
        "portfolio api gateway listening"
    );

    axum::serve(
        listener,
        app.into_make_service_with_connect_info::<SocketAddr>(),
    )
    .await?;

    Ok(())
}
