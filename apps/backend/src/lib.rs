pub mod db;
pub mod error;
pub mod models;
pub mod routes;
pub mod validation;

use axum::Router;
use sqlx::SqlitePool;
use tower_http::cors::{Any, CorsLayer};

#[derive(Clone)]
pub struct AppState {
    pub pool: SqlitePool,
}

pub fn build_app(pool: SqlitePool) -> Router {
    let state = AppState { pool };
    let cors = CorsLayer::new()
        .allow_methods(Any)
        .allow_headers(Any)
        .allow_origin(Any);

    Router::new()
        .nest("/api", routes::router())
        .layer(cors)
        .with_state(state)
}
