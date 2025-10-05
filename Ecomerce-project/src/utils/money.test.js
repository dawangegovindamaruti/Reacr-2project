import {it,expect,describe} from 'vitest';
import { formatemoney } from './money';

describe('formatemoney', () =>{
    it('formats 1999 cents as $19.99', () =>{
    expect(formatemoney(1999)).toBe('$19.99');
    });

it('display 2 decimals', () =>{
    expect(formatemoney(1090)).toBe('$10.90');
   });
})
