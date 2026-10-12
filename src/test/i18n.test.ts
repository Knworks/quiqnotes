import * as assert from 'assert';
import * as fs from 'fs';
import * as path from 'path';
import { MESSAGE_KEY_MAP } from '../extension';

suite('i18n キー', () => {
	test('msg.* キーが英日両方の nls に存在する', () => {
		const root = path.resolve(__dirname, '..', '..');
		const en = JSON.parse(fs.readFileSync(path.join(root, 'package.nls.json'), 'utf8')) as Record<string, unknown>;
		const ja = JSON.parse(fs.readFileSync(path.join(root, 'package.nls.ja.json'), 'utf8')) as Record<string, unknown>;

		Object.values(MESSAGE_KEY_MAP).forEach((key) => {
			assert.ok(en[key], `missing in package.nls.json: ${key}`);
			assert.ok(ja[key], `missing in package.nls.ja.json: ${key}`);
		});
	});
});
