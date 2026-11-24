const COMPANY_KEY = 'pure-erp:company';

function storedCompany(): string {
	try {
		return localStorage.getItem(COMPANY_KEY) ?? '';
	} catch {
		return ''; // private mode / blocked storage
	}
}

/** Global UI state shared by the shell (sidebar) and pages (company switcher). */
class UiStore {
	/** Desktop: collapse sidebar to the icon rail ("Menu Close" variant in Figma). */
	sidebarCollapsed = $state(false);
	/** Tablet/mobile: off-canvas sidebar. */
	mobileNavOpen = $state(false);
	/** Name of the company selected in the navbar switcher (kept in sync with the company list). */
	business = $state('');
	#companyId = $state(typeof window === 'undefined' ? '' : storedCompany());

	/**
	 * Id of the selected company. Sent with every API request (X-Company), so each company's data stays
	 * separate. Remembered in this browser so a reload keeps the same company.
	 */
	get companyId() {
		return this.#companyId;
	}
	set companyId(id: string) {
		this.#companyId = id;
		try {
			localStorage.setItem(COMPANY_KEY, id);
		} catch {
			/* not remembered, still works for this visit */
		}
	}

	toggleSidebar() {
		this.sidebarCollapsed = !this.sidebarCollapsed;
	}
}

export const ui = new UiStore();
