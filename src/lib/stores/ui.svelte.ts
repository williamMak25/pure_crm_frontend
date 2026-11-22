/** Global UI state shared by the shell (sidebar) and pages (business switcher). */
class UiStore {
	/** Desktop: collapse sidebar to the icon rail ("Menu Close" variant in Figma). */
	sidebarCollapsed = $state(false);
	/** Tablet/mobile: off-canvas sidebar. */
	mobileNavOpen = $state(false);
	/** Business selected in the navbar switcher; '' = all businesses. */
	business = $state('PURE Education');

	toggleSidebar() {
		this.sidebarCollapsed = !this.sidebarCollapsed;
	}
}

export const ui = new UiStore();
