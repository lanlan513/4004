import { Link } from 'react-router-dom';
import PageFrame from './PageFrame';

export default function NotFound() {
  return (
    <PageFrame
      eyebrow="404 · LOST IN THE JUNGLE"
      title="页面不存在"
      intro="这条路径尚未被园区系统登记。返回首页，重新选择一条已开放的路线。"
    >
      <Link
        to="/"
        className="inline-flex bg-amber px-7 py-4 font-serif font-bold tracking-widest text-jungle-950 transition-transform hover:scale-105"
      >
        返回首页
      </Link>
    </PageFrame>
  );
}
