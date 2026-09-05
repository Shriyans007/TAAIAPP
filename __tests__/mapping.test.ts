import { mapEvent } from '@/services/woocommerce/events';
import { stripHtml } from '@/utils/html';
test('sanitises WordPress HTML',()=>expect(stripHtml('<p>Hello &amp; welcome</p><script>bad()</script>')).toBe('Hello & welcome'));
test('maps event without inventing missing fields or price',()=>{const e=mapEvent({id:15751,name:'TAAI ABHINANDANAMALA 2026',slug:'taai-abhinandanamala-2026',description:'<p>Members only</p>',short_description:'',permalink:'https://taai.net.au/cart/taaievents/taai-abhinandanamala-2026/',is_in_stock:true,images:[],attributes:[],extensions:{}});expect(e.date).toBeUndefined();expect(e.venue).toBeUndefined();expect(e).not.toHaveProperty('price');expect(e.ticketUrl).toContain('taai.net.au');});
