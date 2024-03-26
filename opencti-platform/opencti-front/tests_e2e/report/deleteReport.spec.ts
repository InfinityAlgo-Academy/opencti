import { expect, test } from '../fixtures/baseFixtures';
import ReportPage from '../model/report.pageModel';

test('Create a new report page and delete it', async ({ page }) => {
  const reportPage = new ReportPage(page);
  await page.goto('/dashboard/analyses/reports');
  await reportPage.addNewReport();
  await reportPage.getReportNameInput().click();
  await reportPage.getReportNameInput().fill('Test delete report e2e');
  await reportPage.getCreateReportButton().click();
  // Issue on checked line
  await page.getByRole('link', { name: 'Test delete report e2e' }).first().click();
  await reportPage.getMenuReport().click();
  await page.getByRole('menuitem', { name: 'Delete' }).click();
  await page.getByRole('button', { name: 'Delete' }).click();
  await expect(reportPage.getPage()).toBeVisible();

  // TODO find a good way to check if the Report is really deleted
});
