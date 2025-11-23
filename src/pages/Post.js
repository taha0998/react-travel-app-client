import { useCallback, useEffect, useState } from "react";
import Modal from "../components/Modal";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import MapComponent from "../components/Map";

const Post = () => {
  const [mode, setMode] = useState(null);
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { id } = useParams();
  const Navigate = useNavigate();
  
  // Get API base URL with fallback
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';
  
  console.log('🔍 Environment Variables:', {
    apiUrl: process.env.REACT_APP_API_BASE_URL,
    nodeEnv: process.env.NODE_ENV,
    apiUrlUsed: API_BASE_URL
  });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('📡 Fetching post data from:', `${API_BASE_URL}/posts/${id}`);
      
      const response = await axios.get(`${API_BASE_URL}/posts/${id}`, {
        timeout: 10000 // 10 second timeout
      });
      
      console.log('✅ API Response received:', response.data);
      setPost(response.data);
    } catch (error) {
      console.error('❌ API Error details:', {
        message: error.message,
        config: error.config,
        response: error.response?.data,
        status: error.response?.status,
        url: error.config?.url
      });
      
      setError(error.message || 'Failed to fetch post data');
      
      // Show more detailed error for debugging
      if (error.response) {
        // Server responded with error status
        console.error('🚫 Server responded with error:', error.response.status);
      } else if (error.request) {
        // Request was made but no response received
        console.error('🚫 No response received from server');
      } else {
        // Error in request setup
        console.error('🚫 Error in request setup');
      }
    } finally {
      setLoading(false);
    }
  }, [id, API_BASE_URL]);

  const deletePost = async () => {
    try {
      console.log('🗑️ Deleting post from:', `${API_BASE_URL}/delete/${id}`);
      const response = await axios.delete(`${API_BASE_URL}/delete/${id}`);
      console.log('✅ Delete successful:', response.data);
      Navigate("/");
    } catch (error) {
      console.error('❌ Delete failed:', error);
      alert('Failed to delete post');
    }
  };

  useEffect(() => {
    if (id) {
      fetchData();
    }
  }, [fetchData, id]);

  // Loading and error states
  if (loading) {
    return <div className="post-page">Loading post data...</div>;
  }

  if (error) {
    return (
      <div className="post-page">
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <h2>❌ Error Loading Post</h2>
          <p>{error}</p>
          <p>API Base URL: {API_BASE_URL}</p>
          <p>Post ID: {id}</p>
          <button onClick={() => Navigate("/")}>Back to Home</button>
          <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '5px' }}>
            <p><strong>Debugging Tips:</strong></p>
            <ul style={{ textAlign: 'left' }}>
              <li>Check browser console for detailed errors (F12)</li>
              <li>Verify API Base URL in Vercel environment variables</li>
              <li>Test backend directly: {API_BASE_URL}/posts/{id}</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  if (!post?.data) {
    return (
      <div className="post-page">
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <h2>⚠️ No Post Data Found</h2>
          <p>API returned empty data for post ID: {id}</p>
          <p>API URL: {API_BASE_URL}/posts/{id}</p>
          <button onClick={() => Navigate("/")}>Back to Home</button>
        </div>
      </div>
    );
  }

  // Rest of your component remains the same...
  return (
    <div className="post-page">
      <div className="post-page-container">
        <div className="info-container">
          <div className="title-container">
            <h1>{post.data.title}</h1>
            <h4>{post.data.description}</h4>
            <p>
              {post.data.address.region}, {post.data.address.country}, {post.data.website}
            </p>
          </div>
          <div className="button-container">
            <button onClick={deletePost}>X</button>
            <button onClick={() => setMode("edit")}>✎</button>
          </div>
        </div>
        <div className="image-container">
          <MapComponent coords={post.data.address.coords} />
          <img
            className="post-img"
            src={post.data.photo}
            alt={post.data.title}
          />
        </div>
        {mode && (
          <Modal
            mode={mode}
            setMode={setMode}
            currentPost={post}
            fetchData={fetchData}
          />
        )}
      </div>
    </div>
  );
};

export default Post;
