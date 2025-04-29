"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.theme = void 0;
const react_native_paper_1 = require("react-native-paper");
exports.theme = {
    ...react_native_paper_1.DefaultTheme,
    colors: {
        ...react_native_paper_1.DefaultTheme.colors,
        primary: '#D32F2F',
        secondary: '#1976D2',
        background: '#FFFFFF',
        surface: '#F5F5F5',
        accent: '#1976D2',
        error: '#B00020',
        text: '#212121',
        onPrimary: '#FFFFFF',
        onSecondary: '#FFFFFF',
    },
};
