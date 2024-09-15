use tauri_plugin_dialog::DialogExt;
use tauri_plugin_updater::UpdaterExt;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![])
        .setup(|app| {
            let handle = app.handle().clone();
            tauri::async_runtime::spawn(async move { update(&handle).await });
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

async fn update(app: &tauri::AppHandle) -> tauri::Result<()> {
    if let Some(update) = app
        .updater()
        .map_err(|e| tauri::Error::Anyhow(e.into()))?
        .check()
        .await
        .map_err(|e| tauri::Error::Anyhow(e.into()))?
    {
        update
            .download_and_install(|_, _| {}, || {})
            .await
            .map_err(|e| tauri::Error::Anyhow(e.into()))?;
        let result = app
            .dialog()
            .message("New update ready: Would you like to restart?")
            .blocking_show();
        if result {
            app.restart();
        }
    }

    Ok(())
}
