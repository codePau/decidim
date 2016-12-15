import { Component, PropTypes } from 'react';
import { propType }             from 'graphql-anywhere';
import gql                      from 'graphql-tag';
import UserAvatar               from 'react-user-avatar';
import moment                   from 'moment';
import { I18n }                 from 'react-i18nify';

import AddCommentForm           from './add_comment_form.component';

import commentFragment          from './comment.fragment.graphql';
import commentDataFragment      from './comment_data.fragment.graphql';

/**
 * A single comment component with the author info and the comment's body
 * @class
 * @augments Component
 */
class Comment extends Component {
  constructor(props) {
    super(props);

    this.state = {
      showReplyForm: false
    };
  }

  render() {
    const { comment: { id, author, body, createdAt }, articleClassName } = this.props;

    let authorInitialLetter = " ";
    const formattedCreatedAt = ` ${moment(createdAt, "YYYY-MM-DD HH:mm:ss z").format("LLL")}`;
    
    if (author.name.length > 0) {
      authorInitialLetter = author.name[0];
    }

    return (
      <article id={`comment_${id}`} className={articleClassName}>
        <div className="comment__header">
          <div className="author-data">
            <div className="author-data__main">
              <div className="author author--inline">
                <span style={{ color: "#fff" }} className="author__avatar">
                  <UserAvatar size="20" name={authorInitialLetter} />
                </span>
                <a className="author__name">{author.name}</a>
                <time dateTime={createdAt}>{formattedCreatedAt}</time>
              </div>
            </div>
          </div>
        </div>
        <div className="comment__content">
          <p>{ body }</p>
        </div>
        {this._renderReplies()}
        <div className="comment__footer">
          {this._renderReplyButton()}
        </div>
        {this._renderReplyForm()}
      </article>
    );
  }

  /**
   * Render reply button if user can reply the comment
   * @private
   * @returns {Void|DOMElement} - Render the reply button or not if user can reply
   */
  _renderReplyButton() {
    const { comment: { canHaveReplies }, currentUser } = this.props;
    const { showReplyForm } = this.state;

    if (currentUser && canHaveReplies) {
      return (
        <button 
          className="comment__reply muted-link"
          aria-controls="comment1-reply"
          onClick={() => this.setState({ showReplyForm: !showReplyForm })}
        >
          { I18n.t("components.comment.reply") }
        </button>
      );
    }

    return <div>&nbsp;</div>;
  }

  /**
   * Render comment replies alternating the css class
   * @private
   * @returns {Void|DomElement} - A wrapper element with comment replies inside
   */
  _renderReplies() {
    const { comment: { id, replies }, currentUser, articleClassName } = this.props;
    let replyArticleClassName = 'comment comment--nested';
   
    if (articleClassName === 'comment comment--nested') {
      replyArticleClassName = `${replyArticleClassName} comment--nested--alt`;
    }

    if (replies) {
      return (
        <div>
          {
            replies.map((reply) => (
              <Comment
                key={`comment_${id}_reply_${reply.id}`}
                comment={reply}
                currentUser={currentUser}
                articleClassName={replyArticleClassName}
              />
            ))
          }
        </div>
      );
    }
    
    return null;
  }

  /**
   * Render reply form based on the current component state
   * @private
   * @returns {Void|ReactElement} - Render the AddCommentForm component or not
   */
  _renderReplyForm() {
    const { currentUser, comment } = this.props;
    const { showReplyForm } = this.state;

    if (showReplyForm) {
      return (
        <AddCommentForm
          commentableId={comment.id}
          commentableType="Decidim::Comments::Comment"
          currentUser={currentUser}
          showTitle={false}
          submitButtonClassName="button small hollow"
          onCommentAdded={() => this.setState({ showReplyForm: false })}
        />
      );
    }

    return null;
  }
}

Comment.fragments = {
  comment: gql`
    ${commentFragment}
    ${commentDataFragment}
  `,
  commentData: gql`
    ${commentDataFragment}
  `
};

Comment.defaultProps = {
  articleClassName: 'comment'
};

Comment.propTypes = {
  comment: PropTypes.oneOfType([
    propType(Comment.fragments.comment).isRequired,
    propType(Comment.fragments.commentData).isRequired
  ]).isRequired,
  currentUser: PropTypes.shape({
    name: PropTypes.string.isRequired
  }),
  articleClassName: PropTypes.string.isRequired
};

export default Comment;
