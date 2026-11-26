import type { Story } from '../../engine/story';
import { scenes } from './scenes1';
import { part1 } from './story';

const story: Story = { slug: 'bamsi-beyrek', title: 'Bamsı Beyrek — 1. Bölüm', texts: part1, scenes, next: { slug: 'bamsi-beyrek-2', label: '2. Bölüm' } };
export default story;
