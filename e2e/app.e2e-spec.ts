import { VitrivrNgPage } from './app.po';

describe('vitrivr-ng App', () => {
  let page: VitrivrNgPage;

  beforeEach(() => {
    page = new VitrivrNgPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
