use tauri_plugin_dialog::DialogExt;
use tauri_plugin_updater::UpdaterExt;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_log::Builder::new().build())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .setup(|app| {
            let handle = app.handle().clone();
            tauri::async_runtime::spawn(async move {
                if let Err(err) = update(handle).await {
                    log::error!("{err}");
                }
            });

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

fn as_tauri_err(err: tauri_plugin_updater::Error) -> tauri::Error {
    tauri::Error::Anyhow(err.into())
}

async fn update(app: tauri::AppHandle) -> tauri::Result<()> {
    if let Some(update) = app
        .updater()
        .map_err(as_tauri_err)?
        .check()
        .await
        .map_err(as_tauri_err)?
    {
        let mut download = 0;

        update
            .download_and_install(
                |chuck_length, content_length| {
                    download += chuck_length;
                    log::info!("download {download} from {content_length:?}");
                },
                || {
                    log::info!("Download finished");
                },
            )
            .await
            .map_err(as_tauri_err)?;

        let restart = app
            .dialog()
            .message("Update ready, would you like to restart to update?")
            .title("Update")
            .blocking_show();

        if restart {
            app.restart();
        }
    };

    Ok(())
}
