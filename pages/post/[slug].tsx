import Link from "next/link";
import { useRouter } from "next/router";
import styles from "../../styles/Home.module.css";
import { useState } from "react";

const { BLOG_URL, CONTENT_API_KEY } = process.env;

async function getPost(slug: string) {
  const res = await fetch(
    `${BLOG_URL}/ghost/api/v3/content/posts/slug/${slug}?key=${CONTENT_API_KEY}&fields=title,slug,html`
  ).then((res) => res.json());

  return res.posts[0];
}

// Ghost CMS Req
export const getStaticProps = async ({ params }) => {
  const post = await getPost(params.slug);
  return {
    props: { post },
    revalidate: 60,
  };
};

// hello-world - on first req = Ghost CMS call is made
// hello-word - on other req... = filesystem is called

export const getStaticPaths = () => {
  // paths -> slugs which are allowed
  // fallback -> dont show 404, but try to fire getStaticProps if set to true
  return {
    paths: [],
    fallback: true,
  };
};

type Post = {
  title: string;
  html: string;
  slug: string;
};

const Post: React.FC<{ post: Post }> = (props) => {
  const { post } = props;
  const [enableLoadComments, setEnableLoadComments] = useState<boolean>(true);

  const router = useRouter();

  if (router.isFallback) {
    return <h1 className={styles.loader}>Loading...</h1>;
  }

  // disqus comments feature
  function loadComments() {
    setEnableLoadComments(false);
    (window as any).disqus_config = function () {
      this.page.url = window.location.href;
      this.page.identifier = post.slug;
    };

    const script = document.createElement("script");
    script.src = "https://ghost-blog-site.disqus.com/embed.js";
    script.setAttribute("data-timestamp", Date.now().toString());

    document.body.appendChild(script);
  }
  return (
    <div className={styles.container}>
      <Link href="/">
        <a className={styles.goback}>Go back</a>
      </Link>
      <h1>{post.title}</h1>
      <div dangerouslySetInnerHTML={{ __html: post.html }}></div>
      {enableLoadComments && (
        <p className={styles.loadComments} onClick={loadComments}>
          Load Comments
        </p>
      )}
      <div className={styles.comments} id="disqus_thread"></div>
    </div>
  );
};

export default Post;
