import { Page } from '@playwright/test';

export default class GroupingsPage {
  constructor(private page: Page) {}

  getPage() {
    return this.page.getByTestId('groupings-page');
  }

  addNew() {
    return this.getCreateButton().click();
  }

  closeNew() {
    return this.page.getByLabel('Close', { exact: true }).click();
  }

  getNameInput() {
    return this.page.getByLabel('Name');
  }

  getCreateButton() {
    return this.page.getByRole('button', { name: 'Add', exact: true });
  }

  getItemFromList(name: string) {
    return this.page.getByRole('link', { name }).first();
  }
}
