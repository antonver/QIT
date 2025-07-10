#!/usr/bin/env python3
"""
Скрипт для удаления всех пользователей через API
"""
import requests
import json

# URL API (замените на ваш локальный URL если нужно)
API_BASE_URL = "https://aeon-messenger-app-09faae856b73.herokuapp.com"

def delete_all_users():
    """Удаляет всех пользователей через API"""
    try:
        # Получаем список пользователей
        response = requests.get(f"{API_BASE_URL}/users/")
        
        if response.status_code == 200:
            users_data = response.json()
            user_count = len(users_data.get('users', []))
            print(f"Найдено пользователей: {user_count}")
            
            if user_count == 0:
                print("Пользователей для удаления не найдено.")
                return
            
            # Подтверждение удаления
            confirm = input(f"Вы уверены, что хотите удалить всех {user_count} пользователей? (yes/no): ")
            if confirm.lower() != 'yes':
                print("Операция отменена.")
                return
            
            # Удаляем каждого пользователя
            deleted_count = 0
            for user in users_data.get('users', []):
                user_id = user.get('id')
                if user_id:
                    delete_response = requests.delete(f"{API_BASE_URL}/users/{user_id}")
                    if delete_response.status_code == 200:
                        deleted_count += 1
                        print(f"Удален пользователь ID: {user_id}")
                    else:
                        print(f"Ошибка при удалении пользователя ID: {user_id}")
            
            print(f"Успешно удалено {deleted_count} пользователей.")
        else:
            print(f"Ошибка при получении списка пользователей: {response.status_code}")
            
    except Exception as e:
        print(f"Ошибка: {e}")

if __name__ == "__main__":
    delete_all_users() 