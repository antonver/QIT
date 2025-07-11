#!/usr/bin/env python3
"""
Тест для проверки функционала добавления админа
"""
import requests
import json

# URL вашего API (замените на актуальный)
BASE_URL = "https://aeon-backend-2892-d50dfbe26b14.herokuapp.com"

def test_make_admin():
    """Тестируем добавление админа по username"""

    # Данные для тестирования (замените на реальные)
    test_username = "test_user"  # username пользователя для назначения админом
    admin_token = "your_admin_token_here"  # токен существующего админа

    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {admin_token}"  # если используется Bearer токен
        # или используйте заголовок Telegram init data:
        # "x-telegram-init-data": "your_telegram_init_data"
    }

    # Данные запроса - теперь отправляем JSON
    data = {
        "username": test_username
    }

    url = f"{BASE_URL}/api/v1/admin/users/make-admin-by-username"

    print(f"Отправляем POST запрос на {url}")
    print(f"Данные: {json.dumps(data, indent=2)}")
    print(f"Заголовки: {json.dumps(headers, indent=2)}")

    try:
        response = requests.post(url, json=data, headers=headers)

        print(f"\nОтвет сервера:")
        print(f"Статус: {response.status_code}")
        print(f"Заголовки ответа: {dict(response.headers)}")

        if response.status_code == 200:
            result = response.json()
            print(f"Успех! Ответ: {json.dumps(result, indent=2, ensure_ascii=False)}")
        else:
            print(f"Ошибка: {response.status_code}")
            try:
                error_data = response.json()
                print(f"Детали ошибки: {json.dumps(error_data, indent=2, ensure_ascii=False)}")
            except:
                print(f"Текст ошибки: {response.text}")

    except requests.exceptions.RequestException as e:
        print(f"Ошибка сети: {e}")

if __name__ == "__main__":
    print("=== Тест добавления админа ===")
    test_make_admin()
