/*!
 * @license
 * Alfresco Example Content Application
 *
 * Copyright (C) 2005 - 2020 Alfresco Software Limited
 *
 * This file is part of the Alfresco Example Content Application.
 * If the software was purchased under a paid Alfresco license, the terms of
 * the paid license agreement will prevail.  Otherwise, the software is
 * provided under the following open source license terms:
 *
 * The Alfresco Example Content Application is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * The Alfresco Example Content Application is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with Alfresco. If not, see <http://www.gnu.org/licenses/>.
 */

import { LoginPage, BrowsingPage } from '../../pages/pages';
import { Utils } from '../../utilities/utils';
import { AdminActions } from '../../utilities/admin-actions';
import { RepoClient } from '../../utilities/repo-client/repo-client';

describe('Pagination on multiple pages', () => {
  const random = Utils.random();

  const username = `user-${random}`;

  const userApi = new RepoClient(username, username);
  const adminApiActions = new AdminActions();

  const loginPage = new LoginPage();
  const page = new BrowsingPage();
  const { dataTable, pagination } = page;

  const sites = Array(101)
    .fill('site')
    .map((name, index): string => `${name}-${index + 1}-${random}`);

  beforeAll(async () => {
    await adminApiActions.createUser({ username });
    await userApi.sites.createSitesPrivate(sites);
    await userApi.sites.waitForApi({ expect: 101 });
    await loginPage.loginWith(username);
  });

  afterAll(async () => {
    await userApi.sites.deleteSites(sites);
  })

  describe('on My Libraries', () => {
    beforeAll(async () => {
      await page.goToMyLibrariesAndWait();
    });

    afterEach(async () => {
      await Utils.pressEscape();
    });

    it('Pagination control default values - [C280086]', async () => {
      expect(await pagination.getRange()).toContain('1-25 of 101');
      expect(await pagination.getMaxItems()).toContain('25');
      expect(await pagination.getCurrentPage()).toContain('Page 1');
      expect(await pagination.getTotalPages()).toContain('of 5');
      expect(await pagination.isPreviousEnabled()).toBe(false, 'Previous button is enabled');
      expect(await pagination.isNextEnabled()).toBe(true, 'Next button is not enabled');
    });

    it('Items per page values - [C280087]', async () => {
      await pagination.openMaxItemsMenu();
      expect(await pagination.menu.getNthItem(1).getText()).toBe('25');
      expect(await pagination.menu.getNthItem(2).getText()).toBe('50');
      expect(await pagination.menu.getNthItem(3).getText()).toBe('100');
      await pagination.menu.closeMenu();
    });

    it('current page menu items - [C280088]', async () => {
      await pagination.openMaxItemsMenu();
      await pagination.menu.clickMenuItem('25');
      expect(await pagination.getMaxItems()).toContain('25');
      expect(await pagination.getTotalPages()).toContain('of 5');
      await pagination.openCurrentPageMenu();
      expect(await pagination.menu.getItemsCount()).toBe(5);
      await pagination.menu.closeMenu();

      await pagination.openMaxItemsMenu();
      await pagination.menu.clickMenuItem('50');
      expect(await pagination.getMaxItems()).toContain('50');
      expect(await pagination.getTotalPages()).toContain('of 3');
      await pagination.openCurrentPageMenu();
      expect(await pagination.menu.getItemsCount()).toBe(3);
      await pagination.menu.closeMenu();

      await pagination.openMaxItemsMenu();
      await pagination.menu.clickMenuItem('100');
      expect(await pagination.getMaxItems()).toContain('100');
      expect(await pagination.getTotalPages()).toContain('of 2');
      await pagination.openCurrentPageMenu();
      expect(await pagination.menu.getItemsCount()).toBe(2);
      await pagination.menu.closeMenu();

      await pagination.resetToDefaultPageSize();
    });

    it('change the current page from menu - [C280089]', async () => {
      await pagination.openCurrentPageMenu();
      await pagination.menu.clickNthItem(3);
      await dataTable.waitForHeader();
      expect(await pagination.getRange()).toContain('51-75 of 101');
      expect(await pagination.getCurrentPage()).toContain('Page 3');
      expect(await pagination.isPreviousEnabled()).toBe(true, 'Previous button is not enabled');
      expect(await pagination.isNextEnabled()).toBe(true, 'Next button is not enabled');
      expect(await dataTable.isItemPresent('site-60')).toBe(true, 'Site-60 not found on page');

      await pagination.resetToDefaultPageNumber();
    });

    it('navigate to next and previous pages - [C280092]', async () => {
      await pagination.clickNext();
      await dataTable.waitForHeader();
      expect(await pagination.getRange()).toContain('26-50 of 101');
      expect(await dataTable.isItemPresent('site-31')).toBe(true, 'Site-31 not found on page');
      await pagination.resetToDefaultPageNumber();

      await pagination.openCurrentPageMenu();
      await pagination.menu.clickNthItem(2);
      await dataTable.waitForHeader();
      await pagination.clickPrevious();
      await dataTable.waitForHeader();
      expect(await pagination.getRange()).toContain('1-25 of 101');
      expect(await dataTable.isItemPresent('site-12')).toBe(true, 'Site-12 not found on page');

      await pagination.resetToDefaultPageNumber();
    });

    it('Previous button is disabled on first page - [C280090]', async () => {
      expect(await pagination.getCurrentPage()).toContain('Page 1');
      expect(await pagination.isPreviousEnabled()).toBe(false, 'Previous button is enabled on first page');
    });

    it('Next button is disabled on last page - [C280091]', async () => {
      await pagination.openCurrentPageMenu();
      await pagination.menu.clickNthItem(5);
      expect(await dataTable.getRowsCount()).toBe(1, 'Incorrect number of items on the last page');
      expect(await pagination.getCurrentPage()).toContain('Page 5');
      expect(await pagination.isNextEnabled()).toBe(false, 'Next button is enabled on last page');
    });
  });

  describe('on Favorite Libraries', () => {
    beforeAll(async () => {
      await page.goToFavoriteLibrariesAndWait();
    });

    afterEach(async () => {
      await Utils.pressEscape();
    });

    it('Pagination control default values - [C291875]', async () => {
      expect(await pagination.getRange()).toContain('1-25 of 101');
      expect(await pagination.getMaxItems()).toContain('25');
      expect(await pagination.getCurrentPage()).toContain('Page 1');
      expect(await pagination.getTotalPages()).toContain('of 5');
      expect(await pagination.isPreviousEnabled()).toBe(false, 'Previous button is enabled');
      expect(await pagination.isNextEnabled()).toBe(true, 'Next button is not enabled');
    });

    it('Items per page values - [C291876]', async () => {
      await pagination.openMaxItemsMenu();
      expect(await pagination.menu.getNthItem(1).getText()).toBe('25');
      expect(await pagination.menu.getNthItem(2).getText()).toBe('50');
      expect(await pagination.menu.getNthItem(3).getText()).toBe('100');
      await pagination.menu.closeMenu();
    });

    it('current page menu items - [C291877]', async () => {
      await pagination.openMaxItemsMenu();
      await pagination.menu.clickMenuItem('25');
      expect(await pagination.getMaxItems()).toContain('25');
      expect(await pagination.getTotalPages()).toContain('of 5');
      await pagination.openCurrentPageMenu();
      expect(await pagination.menu.getItemsCount()).toBe(5);
      await pagination.menu.closeMenu();

      await pagination.openMaxItemsMenu();
      await pagination.menu.clickMenuItem('50');
      expect(await pagination.getMaxItems()).toContain('50');
      expect(await pagination.getTotalPages()).toContain('of 3');
      await pagination.openCurrentPageMenu();
      expect(await pagination.menu.getItemsCount()).toBe(3);
      await pagination.menu.closeMenu();

      await pagination.openMaxItemsMenu();
      await pagination.menu.clickMenuItem('100');
      expect(await pagination.getMaxItems()).toContain('100');
      expect(await pagination.getTotalPages()).toContain('of 2');
      await pagination.openCurrentPageMenu();
      expect(await pagination.menu.getItemsCount()).toBe(2);
      await pagination.menu.closeMenu();

      await pagination.resetToDefaultPageSize();
    });

    it('change the current page from menu - [C291878]', async () => {
      await pagination.openCurrentPageMenu();
      await pagination.menu.clickNthItem(3);
      await dataTable.waitForHeader();
      expect(await pagination.getRange()).toContain('51-75 of 101');
      expect(await pagination.getCurrentPage()).toContain('Page 3');
      expect(await pagination.isPreviousEnabled()).toBe(true, 'Previous button is not enabled');
      expect(await pagination.isNextEnabled()).toBe(true, 'Next button is not enabled');
      expect(await dataTable.isItemPresent('site-40')).toBe(true, 'Site-60 not found on page');

      await pagination.resetToDefaultPageNumber();
    });

    it('navigate to next and previous pages - [C291881]', async () => {
      await pagination.clickNext();
      await dataTable.waitForHeader();
      expect(await pagination.getRange()).toContain('26-50 of 101');
      expect(await dataTable.isItemPresent('site-70')).toBe(true, 'Site-31 not found on page');
      await pagination.resetToDefaultPageNumber();

      await pagination.openCurrentPageMenu();
      await pagination.menu.clickNthItem(2);
      await dataTable.waitForHeader();
      await pagination.clickPrevious();
      await dataTable.waitForHeader();
      expect(await pagination.getRange()).toContain('1-25 of 101');
      expect(await dataTable.isItemPresent('site-88')).toBe(true, 'Site-12 not found on page');

      await pagination.resetToDefaultPageNumber();
    });

    it('Previous button is disabled on first page - [C291879]', async () => {
      expect(await pagination.getCurrentPage()).toContain('Page 1');
      expect(await pagination.isPreviousEnabled()).toBe(false, 'Previous button is enabled on first page');
    });

    it('Next button is disabled on last page - [C291880]', async () => {
      await pagination.openCurrentPageMenu();
      await pagination.menu.clickNthItem(5);
      expect(await dataTable.getRowsCount()).toBe(1, 'Incorrect number of items on the last page');
      expect(await pagination.getCurrentPage()).toContain('Page 5');
      expect(await pagination.isNextEnabled()).toBe(false, 'Next button is enabled on last page');
    });
  });

});
