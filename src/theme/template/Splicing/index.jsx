import React from 'react';
import DocumentTitle from 'react-document-title';
import { TweenOneGroup } from 'rc-tween-one';
import Tag from 'antd/lib/tag';
import Button from 'antd/lib/button';
import message from 'antd/lib/message';
import Modal from 'antd/lib/modal';
import Checkbox from 'antd/lib/checkbox';
import webData from './../template.config';
import SplicingAutoResponsive from './SplicingAutoResponsive';
import ListSort from './ListSort';

const CheckboxGroup = Checkbox.Group;

class Splicing extends React.Component {
  static propTypes = {
    className: React.PropTypes.string,
  };

  static defaultProps = {
    className: 'splicing',
  };

  constructor(props) {
    super(props);
    this.state = {
      templateOptData: {},
      modalOpen: false,
      optImgChild: null,
      templateIds: [],
      checkboxIds: [],
    };
  }

  onCancel = () => {
    this.setState({ modalOpen: false });
  };

  onCompleteClick = () => {
    const templateOptData = this.state.templateOptData;
    const optKeys = Object.keys(templateOptData);
    if (!optKeys.length) {
      message.error('你未做任何选择，请选择你需要的板块。');
      return;
    }
    const optImgChild = [];
    const templateIds = [];
    optKeys.sort((a, b) => webData[a].order - webData[b].order)
      .forEach((key) => {
        templateOptData[key].forEach((item) => {
          templateIds.push(`${key}_${item.vars}_${item.key}`);
          optImgChild.push(<span
            key={item.key}
            id={`${key}_${item.vars}_${item.key}`}
          >
            <img src={webData[key].data[item.vars].src} width="100%" />
          </span>);
        });
      });
    this.setState({
      optImgChild,
      templateIds,
      modalOpen: true,
    });
  };

  onListSortChange = (children) => {
    const templateIds = children.map(item => item.props.id);
    this.setState({ templateIds });
  };

  onChildClick = (name, array) => {
    const templateOptData = this.state.templateOptData;
    templateOptData[name] = array;
    this.setState({ templateOptData });
  };

  onClose = (item, key) => {
    const templateOptData = this.state.templateOptData;
    templateOptData[key] = templateOptData[key].filter(_item => item.key !== _item.key);
    this.setState({ templateOptData });
  };

  getOptTags = key => (this.state.templateOptData[key] || []).map(item =>
    <Tag key={item.key} closable afterClose={() => { this.onClose(item, key); }}>
      {`${key}_${item.vars}`}
    </Tag>
  );

  getDataToChildren = () =>
    Object.keys(webData).map((key) => {
      const item = webData[key];
      if (key === 'other') {
        return (<div key={key} className={this.props.className}>
          <h2>{item.name}</h2>
          <div className={`${this.props.className}-checkbox-wrapper`}>
            <CheckboxGroup options={item.data} onChange={this.checkboxChange} />
          </div>
        </div>);
      }
      const imgArr = item.data.map((imgData) => {
        const cImgData = imgData;
        cImgData.width = 250;
        cImgData.height = 152;
        return cImgData;
      });
      const onClick = this.onChildClick.bind(this, key);
      return (<div key={key} className={this.props.className}>
        <TweenOneGroup
          component="h2"
          enter={{ opacity: 0, type: 'from', duration: 300 }}
          leave={{ opacity: 0, duration: 300 }}
        >
          {item.name}
          <span>({item.checkbox ? '多选' : '单选'})</span>
          {this.state.templateOptData[key] && this.state.templateOptData[key].length ?
            (<div key="opt" className={`${this.props.className}-tag-wrapper`}>
              当前选择：
              {this.getOptTags(key)}
            </div>) : ''}
        </TweenOneGroup>
        <SplicingAutoResponsive
          imgArr={imgArr}
          onClick={onClick}
          checkbox={item.checkbox}
          optIndex={this.state.templateOptData[key] || []}
        />
      </div>);
    });

  checkboxChange = (checkedValues) => {
    this.setState({ checkboxIds: checkedValues });
  };

  render() {
    const childrenToRender = this.getDataToChildren();
    const link = encodeURIComponent(`t=${this.state.templateIds.join(',')}${
      this.state.checkboxIds.length ? `&o=${this.state.checkboxIds.join(',')}` : ''
      }`.trim());
    return (<div className={`${this.props.className}-wrapper`}>
      <h3
        style={{
          background: '#f7f7f7',
          marginBottom: 20,
          padding: 10,
          borderRadius: 6,
        }}
      >
        模块正在优化，如有错误、建议或想参于共建这模块的请与&nbsp;
        <a
          href="https://github.com/ant-design/ant-motion/issues"
          target="_blank"
          rel="noopener noreferrer"
        >
          Issues
        </a> 里联系我
      </h3>
      <DocumentTitle title="自由搭配页面 - Ant Motion" />
      {childrenToRender}
      <div className="bottom-btn">
        <Button type="primary" size="large" onClick={this.onCompleteClick}>选择完成</Button>
        <Modal
          visible={this.state.modalOpen}
          onCancel={this.onCancel}
          footer={null}
        >
          <h2 className={`${this.props.className}-modal-title`}>页面布局预览</h2>
          <p className={`${this.props.className}-modal-explain`}>托动下面区块调整页面布局顺序。</p>
          <ListSort
            className={`${this.props.className}-modal-img-wrapper`}
            onChange={this.onListSortChange}
          >
            {this.state.optImgChild}
          </ListSort>
          <div className={`${this.props.className}-modal-button-wrapper`}>
            <a
              href={`/templates/#${link}`}
              target="_black"
              onClick={this.onCancel}
            >
              <Button type="primary">确定</Button>
            </a>
            <Button onClick={this.onCancel}>重选</Button>
          </div>
        </Modal>
      </div>
    </div>);
  }
}
export default Splicing;
