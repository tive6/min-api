#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
use tauri::{Manager};
use tauri_plugin_log::LogTarget;

fn main() {
    let ctx = tauri::generate_context!();

    tauri::Builder::default()
        .plugin(
            tauri_plugin_log::Builder::default()
                .targets([LogTarget::LogDir, LogTarget::Stdout, LogTarget::Webview])
                .build(),
        )
        .setup(|_app| {
            #[cfg(debug_assertions)] // only include this code on debug builds
            {
                let window = _app.get_window("main").unwrap();
                window.open_devtools();
                //                   window.close_devtools();
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![])
        .run(ctx)
        .expect("error while running tauri application");
}
