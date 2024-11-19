export const colors = {
    default: "#1f3746",
    routes: {
        "/": "#e6f4f1",
    },
};

export function setBackgroundColor(pathname) {
    document.body.style.backgroundColor =
        colors.routes[pathname] || colors.default;
}
