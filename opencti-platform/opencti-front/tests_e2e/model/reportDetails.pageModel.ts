import { Page } from '@playwright/test';

export default class ReportDetailsPage {
  constructor(private page: Page) {}

  getReportDetailsPage() {
    return this.page.getByTestId('report-details-page');
  }

  getTitle(name: string) {
    return this.page.getByRole('heading', { name });
  }

  getEditButton() {
    return this.page.getByLabel('Edit');
  }

  getObservablesTab() {
    return this.page.getByRole('tab', { name: 'Observables' });
  }
}
