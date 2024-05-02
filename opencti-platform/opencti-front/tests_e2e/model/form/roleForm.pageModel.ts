// eslint-disable-next-line import/no-extraneous-dependencies
import { Page } from '@playwright/test';

export default class RoleFormPage {
  constructor(private page: Page) {}

  getNameInput() {
    return this.page.getByLabel('Name');
  }

  async fillNameInput(name: string) {
    await this.getNameInput().click();
    return this.getNameInput().fill(name);
  }

  getCreateButton() {
    return this.page.getByRole('button', { name: 'Create' });
  }

  getCapabilitiesTab() {
    return this.page.getByRole('tab', { name: 'Capabilities' });
  }

  getAccessKnowledgeCheckbox() {
    return this.page.getByRole('list').locator('li').filter({ hasText: 'Access knowledge' }).getByRole('checkbox');
  }

  getCreateUpdateKnowledgeCheckbox() {
    return this.page.locator('li').filter({ hasText: 'Create / Update knowledge' }).getByRole('checkbox');
  }

  getAccessAdministrationCheckbox() {
    return this.page.getByRole('list').locator('li').filter({ hasText: 'Access administration' }).getByRole('checkbox');
  }
}
