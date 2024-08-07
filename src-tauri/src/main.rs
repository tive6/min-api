// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
use tauri::{Manager, CustomMenuItem, Menu, MenuItem, Submenu};

use tauri_plugin_log::{LogTarget};

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

fn main() {
  let ctx = tauri::generate_context!();

  let quit = CustomMenuItem::new("quit".to_string(), "退出");
  let close = CustomMenuItem::new("close".to_string(), "关闭");
  let submenu = Submenu::new("File", Menu::new().add_item(quit).add_item(close));
  let _menu = Menu::new()
    .add_native_item(MenuItem::Copy)
    .add_item(CustomMenuItem::new("hide", "Hide"))
    .add_submenu(submenu);

  // let menu = Menu::new(); // configure the menu
  tauri::Builder::default()
        .plugin(tauri_plugin_log::Builder::default().targets([
            LogTarget::LogDir,
            LogTarget::Stdout,
            LogTarget::Webview,
        ]).build())
        .setup(|_app| {
              #[cfg(debug_assertions)] // only include this code on debug builds
              {
                  let window = _app.get_window("main").unwrap();
                  window.open_devtools();
//                   window.close_devtools();
              }
              Ok(())
          })
        // .menu(menu)
        .invoke_handler(tauri::generate_handler![greet])
        .run(ctx)
        .expect("error while running tauri application");
}
