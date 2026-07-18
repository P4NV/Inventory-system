export interface NavItem {
  title: string;
  path: string;
}

export const navItems: NavItem[] = [
    { title: "Home", path: "/" },
    { title: "Dashboard", path: "/dashboard" },
    { title: "Inventory", path: "/inventory" },
];
