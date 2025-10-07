#!/usr/bin/env python3
"""
Скрипт для заполнения базы данных тестовыми данными
Запуск: python run_seed.py
"""

import subprocess
import sys
import os

def main():
    """Запускает скрипт заполнения базы данных"""
    
    print("🌱 Заполнение базы данных тестовыми данными...")
    print("📍 Генерируем 100 записей настроений в пределах Алматы")
    print("⏰ Временной диапазон: последние 24 часа")
    print("🎯 Настроения: случайные от 1 до 5")
    print()
    
    try:
        # Запускаем скрипт заполнения
        result = subprocess.run([
            sys.executable, "seed_data.py"
        ], cwd=os.path.dirname(os.path.abspath(__file__)), check=True)
        
        print()
        print("✅ Тестовые данные успешно добавлены!")
        print("🚀 Теперь можно запустить сервер и посмотреть на карте")
        
    except subprocess.CalledProcessError as e:
        print(f"❌ Ошибка при заполнении базы данных: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"❌ Неожиданная ошибка: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
