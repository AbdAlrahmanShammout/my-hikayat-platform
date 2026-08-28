import { buildCheckoutReturnPage } from './build-checkout-return-page.helper';

describe('buildCheckoutReturnPage', () => {
  it('renders a meta refresh and continue link to the return URL', () => {
    const actualHtml: string = buildCheckoutReturnPage('reader://billing/success');
    expect(actualHtml).toContain('content="0;url=reader://billing/success"');
    expect(actualHtml).toContain('href="reader://billing/success"');
  });

  it('escapes HTML in the return URL', () => {
    const actualHtml: string = buildCheckoutReturnPage('reader://billing/success?"><script>');
    expect(actualHtml).not.toContain('<script>');
    expect(actualHtml).toContain('&quot;');
    expect(actualHtml).toContain('&lt;script&gt;');
  });
});
