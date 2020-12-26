import styles from "../styles/Home.module.css";
import Link from "next/link";
import Head from "next/head";

const { BLOG_URL, CONTENT_API_KEY } = process.env;

type Post = {
  title: string;
  slug: string;
};

async function getPosts() {
  const res = await fetch(
    `${BLOG_URL}/ghost/api/v3/content/posts/?key=${CONTENT_API_KEY}&fields=title,slug,excerpt`
  ).then((res) => res.json());

  return res.posts;
}

export const getStaticProps = async ({ params }) => {
  const posts = await getPosts();
  return {
    revalidate: 60,
    props: { posts },
  };
};

const Home: React.FC<{ posts: Post[] }> = (props) => {
  const { posts } = props;

  return (
    <div className={styles.container}>
      <h1>Welcome To My Blog</h1>
      <ul>
        {posts.map((post, index) => {
          return (
            <li key={index}>
              <Link href="/post/[slug]" as={`/post/${post.slug}`}>
                <a>{post.title}</a>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default Home;
