use axum::{
    extract::{Path, State},
    http::StatusCode,
    routing::{get, put},
    Json, Router,
};
use chrono::Utc;
use uuid::Uuid;

use crate::{
    error::AppError,
    models::{CreateNote, Note, UpdateNote},
    AppState,
};

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/notes", get(list_notes).post(create_note))
        .route(
            "/notes/:id",
            put(update_note).delete(delete_note).get(get_note),
        )
        .route("/health", get(health))
}

async fn health() -> &'static str {
    "ok"
}

async fn list_notes(State(state): State<AppState>) -> Result<Json<Vec<Note>>, AppError> {
    let notes = sqlx::query_as::<_, Note>(
        "SELECT id, title, body, created_at, updated_at FROM notes ORDER BY created_at DESC",
    )
    .fetch_all(&state.pool)
    .await?;
    Ok(Json(notes))
}

async fn get_note(
    State(state): State<AppState>,
    Path(id): Path<String>,
) -> Result<Json<Note>, AppError> {
    let note = sqlx::query_as::<_, Note>(
        "SELECT id, title, body, created_at, updated_at FROM notes WHERE id = ?",
    )
    .bind(&id)
    .fetch_optional(&state.pool)
    .await?
    .ok_or(AppError::NotFound)?;
    Ok(Json(note))
}

async fn create_note(
    State(state): State<AppState>,
    Json(payload): Json<CreateNote>,
) -> Result<(StatusCode, Json<Note>), AppError> {
    if !crate::validation::is_valid_title(&payload.title) {
        return Err(AppError::Validation("title cannot be empty".into()));
    }

    let id = Uuid::new_v4().to_string();
    let now = Utc::now();

    sqlx::query(
        "INSERT INTO notes (id, title, body, created_at, updated_at) VALUES (?, ?, ?, ?, ?)",
    )
    .bind(&id)
    .bind(&payload.title)
    .bind(&payload.body)
    .bind(now)
    .bind(now)
    .execute(&state.pool)
    .await?;

    let note = Note {
        id,
        title: payload.title,
        body: payload.body,
        created_at: now,
        updated_at: now,
    };

    Ok((StatusCode::CREATED, Json(note)))
}

async fn update_note(
    State(state): State<AppState>,
    Path(id): Path<String>,
    Json(payload): Json<UpdateNote>,
) -> Result<Json<Note>, AppError> {
    let mut note = sqlx::query_as::<_, Note>(
        "SELECT id, title, body, created_at, updated_at FROM notes WHERE id = ?",
    )
    .bind(&id)
    .fetch_optional(&state.pool)
    .await?
    .ok_or(AppError::NotFound)?;

    if let Some(title) = payload.title {
        if !crate::validation::is_valid_title(&title) {
            return Err(AppError::Validation("title cannot be empty".into()));
        }
        note.title = title;
    }
    if let Some(body) = payload.body {
        note.body = body;
    }
    note.updated_at = Utc::now();

    sqlx::query("UPDATE notes SET title = ?, body = ?, updated_at = ? WHERE id = ?")
        .bind(&note.title)
        .bind(&note.body)
        .bind(note.updated_at)
        .bind(&note.id)
        .execute(&state.pool)
        .await?;

    Ok(Json(note))
}

async fn delete_note(
    State(state): State<AppState>,
    Path(id): Path<String>,
) -> Result<StatusCode, AppError> {
    let result = sqlx::query("DELETE FROM notes WHERE id = ?")
        .bind(&id)
        .execute(&state.pool)
        .await?;

    if result.rows_affected() == 0 {
        return Err(AppError::NotFound);
    }

    Ok(StatusCode::NO_CONTENT)
}

#[cfg(test)]
mod tests {
    use crate::{build_app, db::connect_test};
    use axum::body::Body;
    use axum::http::Request;
    use tower::ServiceExt;

    async fn json_body(response: axum::response::Response) -> serde_json::Value {
        let bytes = axum::body::to_bytes(response.into_body(), usize::MAX)
            .await
            .unwrap();
        serde_json::from_slice(&bytes).unwrap()
    }

    #[tokio::test]
    async fn list_returns_empty_initially() {
        let pool = connect_test().await;
        let app = build_app(pool);

        let response = app
            .oneshot(
                Request::builder()
                    .uri("/api/notes")
                    .body(Body::empty())
                    .unwrap(),
            )
            .await
            .unwrap();

        assert_eq!(response.status(), 200);
        let body = json_body(response).await;
        assert_eq!(body, serde_json::json!([]));
    }

    #[tokio::test]
    async fn creates_a_note() {
        let pool = connect_test().await;
        let app = build_app(pool);

        let response = app
            .oneshot(
                Request::builder()
                    .method("POST")
                    .uri("/api/notes")
                    .header("content-type", "application/json")
                    .body(Body::from(r#"{"title":"Hello","body":"World"}"#))
                    .unwrap(),
            )
            .await
            .unwrap();

        assert_eq!(response.status(), 201);
        let body = json_body(response).await;
        assert_eq!(body["title"], "Hello");
        assert_eq!(body["body"], "World");
    }

    #[tokio::test]
    async fn gets_a_note() {
        let pool = connect_test().await;
        let app = build_app(pool);

        let response = app
            .clone()
            .oneshot(
                Request::builder()
                    .method("POST")
                    .uri("/api/notes")
                    .header("content-type", "application/json")
                    .body(Body::from(r#"{"title":"Hello","body":"World"}"#))
                    .unwrap(),
            )
            .await
            .unwrap();
        let created = json_body(response).await;

        let response = app
            .oneshot(
                Request::builder()
                    .uri(format!("/api/notes/{}", created["id"].as_str().unwrap()))
                    .body(Body::empty())
                    .unwrap(),
            )
            .await
            .unwrap();

        assert_eq!(response.status(), 200);
        let body = json_body(response).await;
        assert_eq!(body["title"], "Hello");
    }

    #[tokio::test]
    async fn updates_a_note() {
        let pool = connect_test().await;
        let app = build_app(pool);

        let response = app
            .clone()
            .oneshot(
                Request::builder()
                    .method("POST")
                    .uri("/api/notes")
                    .header("content-type", "application/json")
                    .body(Body::from(r#"{"title":"Old","body":"Body"}"#))
                    .unwrap(),
            )
            .await
            .unwrap();
        let created = json_body(response).await;

        let response = app
            .oneshot(
                Request::builder()
                    .method("PUT")
                    .uri(format!("/api/notes/{}", created["id"].as_str().unwrap()))
                    .header("content-type", "application/json")
                    .body(Body::from(r#"{"title":"New","body":"Updated"}"#))
                    .unwrap(),
            )
            .await
            .unwrap();

        assert_eq!(response.status(), 200);
        let body = json_body(response).await;
        assert_eq!(body["title"], "New");
        assert_eq!(body["body"], "Updated");
    }

    #[tokio::test]
    async fn rejects_empty_update_title() {
        let pool = connect_test().await;
        let app = build_app(pool);

        let response = app
            .clone()
            .oneshot(
                Request::builder()
                    .method("POST")
                    .uri("/api/notes")
                    .header("content-type", "application/json")
                    .body(Body::from(r#"{"title":"Old","body":"Body"}"#))
                    .unwrap(),
            )
            .await
            .unwrap();
        let created = json_body(response).await;

        let response = app
            .oneshot(
                Request::builder()
                    .method("PUT")
                    .uri(format!("/api/notes/{}", created["id"].as_str().unwrap()))
                    .header("content-type", "application/json")
                    .body(Body::from(r#"{"title":"   "}"#))
                    .unwrap(),
            )
            .await
            .unwrap();

        assert_eq!(response.status(), 400);
    }

    #[tokio::test]
    async fn deletes_a_note() {
        let pool = connect_test().await;
        let app = build_app(pool);

        let response = app
            .clone()
            .oneshot(
                Request::builder()
                    .method("POST")
                    .uri("/api/notes")
                    .header("content-type", "application/json")
                    .body(Body::from(r#"{"title":"Delete me","body":"Body"}"#))
                    .unwrap(),
            )
            .await
            .unwrap();
        let created = json_body(response).await;

        let response = app
            .oneshot(
                Request::builder()
                    .method("DELETE")
                    .uri(format!("/api/notes/{}", created["id"].as_str().unwrap()))
                    .body(Body::empty())
                    .unwrap(),
            )
            .await
            .unwrap();

        assert_eq!(response.status(), 204);
    }

    #[tokio::test]
    async fn returns_404_when_deleting_missing_note() {
        let pool = connect_test().await;
        let app = build_app(pool);

        let response = app
            .oneshot(
                Request::builder()
                    .method("DELETE")
                    .uri("/api/notes/does-not-exist")
                    .body(Body::empty())
                    .unwrap(),
            )
            .await
            .unwrap();

        assert_eq!(response.status(), 404);
    }

    #[tokio::test]
    async fn rejects_empty_title() {
        let pool = connect_test().await;
        let app = build_app(pool);

        let response = app
            .oneshot(
                Request::builder()
                    .method("POST")
                    .uri("/api/notes")
                    .header("content-type", "application/json")
                    .body(Body::from(r#"{"title":"   ","body":"x"}"#))
                    .unwrap(),
            )
            .await
            .unwrap();

        assert_eq!(response.status(), 400);
    }

    #[tokio::test]
    async fn returns_404_for_missing_note() {
        let pool = connect_test().await;
        let app = build_app(pool);

        let response = app
            .oneshot(
                Request::builder()
                    .uri("/api/notes/does-not-exist")
                    .body(Body::empty())
                    .unwrap(),
            )
            .await
            .unwrap();

        assert_eq!(response.status(), 404);
    }
}
