// Validation utility functions 

export const validateEmail = (email: string): string => {
    if(!email || email.trim() === '') {
        return 'Email is required';
    }
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if(!re.test(email)) {
        return 'Invalid email format';
    }
    return '';
};

export const validatePhone = (phone: string): string => {
    if(!phone || phone.trim() === '') {
        return 'Phone number is required';
    }
    const re = /^\d{10}$/;
    if(!re.test(phone)) {
        return 'Invalid phone number format';
    }
    return '';
};

export const validateNumber = (value: string): string => {
    if (!value || value.trim() === '') {
        return 'Number is required';
    }
    const re = /^\d+$/;
    if (!re.test(value)) {
        return 'Invalid number format';
    }
    return '';
};

export const validateRequired = (value: string): string => {
    if (!value || value.trim() === '') {
        return 'This field is required';
    }
    return '';
};

export const validateField = (inputType: string, value: string): string => {
    switch (inputType) {
        case 'email':
            return validateEmail(value);
        case 'tel':
            return validatePhone(value);
        case 'number':
            return validateNumber(value);
        default:
            return validateRequired(value);
    }
};
