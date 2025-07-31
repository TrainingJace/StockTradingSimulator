// 通用的表单处理Hook

import { useState, useCallback } from 'react';
import { validateEmail, validatePassword, validateRequired } from '../utils/formatters';

/**
 * 通用表单Hook
 * @param {Object} initialValues - 初始表单值
 * @param {Object} validationRules - 验证规则
 * @param {Function} onSubmit - 提交处理函数
 * @returns {Object} 表单状态和操作方法
 */
export const useForm = (initialValues = {}, validationRules = {}, onSubmit) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 更新单个字段值
  const setValue = useCallback((name, value) => {
    setValues(prev => ({
      ...prev,
      [name]: value
    }));
    
    // 如果字段已被触摸过，立即验证
    if (touched[name]) {
      validateField(name, value);
    }
  }, [touched]);

  // 处理输入变化
  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    const fieldValue = type === 'checkbox' ? checked : value;
    setValue(name, fieldValue);
  }, [setValue]);

  // 处理字段失焦
  const handleBlur = useCallback((e) => {
    const { name, value } = e.target;
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
    validateField(name, value);
  }, []);

  // 验证单个字段
  const validateField = useCallback((name, value) => {
    const rules = validationRules[name];
    if (!rules) return;

    let error = '';

    // 必填验证
    if (rules.required && !validateRequired(value)) {
      error = rules.requiredMessage || `${name} is required`;
    }
    // 邮箱验证
    else if (rules.email && value && !validateEmail(value)) {
      error = rules.emailMessage || 'Please enter a valid email address';
    }
    // 密码验证
    else if (rules.password && value && !validatePassword(value)) {
      error = rules.passwordMessage || 'Password must be at least 6 characters';
    }
    // 自定义验证
    else if (rules.custom && value) {
      const customError = rules.custom(value, values);
      if (customError) {
        error = customError;
      }
    }

    setErrors(prev => ({
      ...prev,
      [name]: error
    }));

    return !error;
  }, [validationRules, values]);

  // 验证所有字段
  const validateAll = useCallback(() => {
    const newErrors = {};
    let isValid = true;

    Object.keys(validationRules).forEach(name => {
      const value = values[name];
      if (!validateField(name, value)) {
        isValid = false;
        newErrors[name] = errors[name];
      }
    });

    // 标记所有字段为已触摸
    const newTouched = {};
    Object.keys(validationRules).forEach(name => {
      newTouched[name] = true;
    });
    setTouched(newTouched);

    return isValid;
  }, [values, validationRules, errors, validateField]);

  // 处理表单提交
  const handleSubmit = useCallback(async (e) => {
    if (e) {
      e.preventDefault();
    }

    if (isSubmitting) return;

    const isValid = validateAll();
    if (!isValid) return;

    try {
      setIsSubmitting(true);
      if (onSubmit) {
        await onSubmit(values);
      }
    } catch (error) {
      console.error('Form submission error:', error);
      // 可以设置全局错误或传递给父组件
    } finally {
      setIsSubmitting(false);
    }
  }, [values, validateAll, onSubmit, isSubmitting]);

  // 重置表单
  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  // 设置表单错误（用于服务器验证错误）
  const setFormErrors = useCallback((serverErrors) => {
    setErrors(prev => ({
      ...prev,
      ...serverErrors
    }));
  }, []);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    setValue,
    reset,
    setFormErrors,
    validateField,
    validateAll
  };
};

/**
 * 登录表单Hook
 * @param {Function} onSubmit - 登录提交函数
 * @returns {Object} 登录表单状态和方法
 */
export const useLoginForm = (onSubmit) => {
  const validationRules = {
    username: {
      required: true,
      requiredMessage: 'Please enter username'
    },
    password: {
      required: true,
      password: true,
      requiredMessage: 'Please enter password',
      passwordMessage: 'Password must be at least 6 characters'
    }
  };

  return useForm(
    { username: '', password: '' },
    validationRules,
    onSubmit
  );
};

/**
 * 注册表单Hook
 * @param {Function} onSubmit - 注册提交函数
 * @returns {Object} 注册表单状态和方法
 */
export const useRegisterForm = (onSubmit) => {
  const validationRules = {
    username: {
      required: true,
      requiredMessage: 'Please enter username'
    },
    email: {
      required: true,
      email: true,
      requiredMessage: 'Please enter email',
      emailMessage: 'Please enter a valid email address'  
    },
    password: {
      required: true,
      password: true,
      requiredMessage: 'Please enter password',
      passwordMessage: 'Password must be at least 6 characters'
    },
    confirmPassword: {
      required: true,
      requiredMessage: 'Please confirm password',
      custom: (value, allValues) => {
        if (value !== allValues.password) {
          return 'Passwords do not match';
        }
        return null;
      }
    }
  };

  return useForm(
    { username: '', email: '', password: '', confirmPassword: '' },
    validationRules,
    onSubmit
  );
};
