'use strict';

class Order {
    constructor(data) {
        this.name = data.name;
        this.phone = data.phone;
        this.email = data.email;
        this.deliveryDate = data.deliveryDate;
        this.quantity = data.quantity;
        this.budget = data.budget;
        this.bouquet = data.bouquet;
        this.delivery = data.delivery;
        this.comment = data.comment;
        this.consent = data.consent;
        this.createdAt = new Date();
    }

    formatDate(dateString) {
        const date = new Date(dateString + 'T00:00:00');
        return date.toLocaleDateString('ru-RU');
    }

    print() {
        const lines = [
            '=== Новый заказ ===',
            `Имя: ${this.name}`,
            `Телефон: ${this.phone}`,
            `Email: ${this.email}`,
            `Дата доставки: ${this.formatDate(this.deliveryDate)}`,
            `Количество букетов: ${this.quantity}`,
            `Бюджет: ${this.budget.toFixed(2)} ₽`,
            `Букет: ${this.bouquet}`,
            `Способ получения: ${this.delivery}`,
            `Комментарий: ${this.comment || '—'}`,
            `Согласие на обработку данных: ${this.consent ? 'да' : 'нет'}`,
            `Создан: ${this.createdAt.toLocaleString('ru-RU')}`
        ];

        console.log(lines.join('\n'));
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('orderForm');

    if (!form) {
        return;
    }

    const status = form.querySelector('.form__status');

    const setError = (name, message) => {
        const error = form.querySelector(`[data-error-for="${name}"]`);
        const field = form.elements[name];

        if (error) {
            error.textContent = message;
        }

        if (field && field.classList) {
            field.classList.add('form__input--error');
        }
    };

    const clearErrors = () => {
        form.querySelectorAll('.form__error').forEach((element) => {
            element.textContent = '';
        });

        form.querySelectorAll('.form__input--error, .form__select--error, .form__textarea--error')
            .forEach((element) => {
                element.classList.remove(
                    'form__input--error',
                    'form__select--error',
                    'form__textarea--error'
                );
            });

        status.textContent = '';
        status.classList.remove('form__status--error', 'form__status--success');
    };

    const normalizePhone = (value) => value.replace(/\D/g, '');

    const validate = (data) => {
        const errors = {};

        const name = data.name.trim();
        if (
            name.length < 2 ||
            name.length > 40 ||
            !/^[А-Яа-яЁёA-Za-z\s-]+$/.test(name)
        ) {
            errors.name = 'Введите имя: 2–40 букв, пробел или дефис.';
        }

        const phone = data.phone.trim();
        const phoneDigits = normalizePhone(phone);
        if (
            !/^[+\d\s()\-]+$/.test(phone) ||
            !/^[78]\d{10}$/.test(phoneDigits)
        ) {
            errors.phone = 'Телефон в формате +7 (999) 000-00-00 или 8 999 000-00-00.';
        }

        const email = data.email.trim();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
            errors.email = 'Введите корректный email.';
        }

        const dateRaw = data.deliveryDate.trim();
        if (!dateRaw) {
            errors.deliveryDate = 'Укажите дату доставки.';
        } else {
            const selected = new Date(dateRaw + 'T00:00:00');
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            if (Number.isNaN(selected.getTime())) {
                errors.deliveryDate = 'Дата указана неверно.';
            } else if (selected < today) {
                errors.deliveryDate = 'Дата не может быть в прошлом.';
            } else {
                const maxDate = new Date(today);
                maxDate.setDate(maxDate.getDate() + 365);

                if (selected > maxDate) {
                    errors.deliveryDate = 'Дата не может быть позже чем через год.';
                }
            }
        }

        const quantityRaw = data.quantity.trim();
        const quantity = Number(quantityRaw);
        if (
            !quantityRaw ||
            !Number.isFinite(quantity) ||
            !Number.isInteger(quantity) ||
            quantity < 1 ||
            quantity > 99
        ) {
            errors.quantity = 'Количество — целое число от 1 до 99.';
        }

        const budgetRaw = data.budget.trim();
        const budget = Number(budgetRaw);
        if (
            !budgetRaw ||
            !Number.isFinite(budget) ||
            budget <= 0 ||
            budget > 100000
        ) {
            errors.budget = 'Бюджет — число больше 0 и не более 100 000 ₽.';
        }

        if (!['Розы', 'Пионы', 'Хризантемы', 'Микс'].includes(data.bouquet)) {
            errors.bouquet = 'Выберите букет из списка.';
        }

        if (!['Самовывоз', 'Доставка'].includes(data.delivery)) {
            errors.delivery = 'Выберите способ получения.';
        }

        if (data.comment.length > 300) {
            errors.comment = 'Комментарий не длиннее 300 символов.';
        }

        if (!data.consent) {
            errors.consent = 'Нужно согласие на обработку данных.';
        }

        return errors;
    };

    form.addEventListener('input', (event) => {
        const name = event.target.name;

        if (!name) {
            return;
        }

        const error = form.querySelector(`[data-error-for="${name}"]`);

        if (error && error.textContent) {
            error.textContent = '';
            event.target.classList.remove(
                'form__input--error',
                'form__select--error',
                'form__textarea--error'
            );
        }
    });

    form.addEventListener('submit', (event) => {
        event.preventDefault();
        clearErrors();

        const formData = new FormData(form);

        const data = {
            name: String(formData.get('name') || ''),
            phone: String(formData.get('phone') || ''),
            email: String(formData.get('email') || ''),
            deliveryDate: String(formData.get('deliveryDate') || ''),
            quantity: String(formData.get('quantity') || ''),
            budget: String(formData.get('budget') || ''),
            bouquet: String(formData.get('bouquet') || ''),
            delivery: String(formData.get('delivery') || ''),
            comment: String(formData.get('comment') || ''),
            consent: form.elements.consent.checked
        };

        const errors = validate(data);
        const errorKeys = Object.keys(errors);

        if (errorKeys.length > 0) {
            errorKeys.forEach((key) => {
                setError(key, errors[key]);

                const field = form.elements[key];

                if (!field || !field.classList) {
                    return;
                }

                if (field.tagName === 'SELECT') {
                    field.classList.add('form__select--error');
                } else if (field.tagName === 'TEXTAREA') {
                    field.classList.add('form__textarea--error');
                }
            });

            status.textContent = 'Проверьте поля формы на ошибки.';
            status.classList.add('form__status--error');

            const firstField = form.elements[errorKeys[0]];

            if (firstField && typeof firstField.focus === 'function') {
                firstField.focus();
            }

            return;
        }

        const order = new Order({
            ...data,
            quantity: Number(data.quantity),
            budget: Number(data.budget)
        });

        order.print();

        status.textContent = 'Спасибо за заказ!';
        status.classList.add('form__status--success');

        form.reset();
    });
});