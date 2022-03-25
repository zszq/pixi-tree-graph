import { Container } from '@pixi/display';
import { InteractionEvent } from '@pixi/interaction';
import { IPointData } from '@pixi/math';
import { TypedEmitter } from 'tiny-typed-emitter';
import { createNode, updateNodeStyle, updateNodeVisibility } from './renderers/node';
import { createNodeLabel, updateNodeLabelStyle, updateNodeLabelVisibility } from './renderers/node-label';
import { createNodeContent, updateNodeContentStyle, updateNodeContentVisibility } from './renderers/node-content';
import { createNodeAttach, updateNodeAttachVisibility, updateNodeAttachStyle } from './renderers/node-attach';
import { NodeStyle } from './utils/style';
import { TextureCache } from './texture-cache';
// import { DropShadowFilter } from '@pixi/filter-drop-shadow';

interface PixiNodeEvents {
  mousemove: (event: MouseEvent) => void;
  mouseover: (event: MouseEvent) => void;
  mouseout: (event: MouseEvent) => void;
  mousedown: (event: MouseEvent) => void;
  mouseup: (event: MouseEvent) => void;
  rightclick: (event: MouseEvent) => void;
  btnmousemove: (event: MouseEvent) => void;
  btnmouseover: (event: MouseEvent) => void;
  btnmouseout: (event: MouseEvent) => void;
  btnmousedown: (event: MouseEvent) => void;
  btnmouseup: (event: MouseEvent) => void;
  btnrightclick: (event: MouseEvent) => void;
}

export class PixiNode extends TypedEmitter<PixiNodeEvents> {
  nodeStyle: NodeStyle;
  nodeGfx: Container;
  nodeLabelGfx: Container;
  nodeContentGfx: Container;
  nodeAttachGfx: Container;

  hovered: boolean = false;

  constructor(option: { nodeStyle: NodeStyle }) {
    super();

    this.nodeStyle = option.nodeStyle;
    this.nodeGfx = this.createNode();
    this.nodeLabelGfx = this.createNodeLabel();
    this.nodeContentGfx = this.createNodeContent();
    this.nodeAttachGfx = this.createNodeAttach();
  }

  private createNode() {
    const nodeGfx = new Container();
    // nodeGfx.filters = [new DropShadowFilter()]; // 性能开销太大
    nodeGfx.interactive = true;
    nodeGfx.buttonMode = true;
    nodeGfx.on('mousemove', (event: InteractionEvent) => this.emit('mousemove', event.data.originalEvent as MouseEvent));
    nodeGfx.on('mouseover', (event: InteractionEvent) => this.emit('mouseover', event.data.originalEvent as MouseEvent));
    nodeGfx.on('mouseout', (event: InteractionEvent) => this.emit('mouseout', event.data.originalEvent as MouseEvent));
    nodeGfx.on('mousedown', (event: InteractionEvent) => this.emit('mousedown', event.data.originalEvent as MouseEvent));
    nodeGfx.on('mouseup', (event: InteractionEvent) => this.emit('mouseup', event.data.originalEvent as MouseEvent));
    nodeGfx.on('rightclick', (event: InteractionEvent) => this.emit('rightclick', event.data.originalEvent as MouseEvent));
    createNode(nodeGfx, this.nodeStyle);

    return nodeGfx;
  }

  private createNodeLabel() {
    const nodeLabelGfx = new Container();
    nodeLabelGfx.interactive = true;
    nodeLabelGfx.buttonMode = true;
    // nodeLabelGfx.on('mousemove', (event: InteractionEvent) => this.emit('mousemove', event.data.originalEvent as MouseEvent));
    // nodeLabelGfx.on('mouseover', (event: InteractionEvent) => this.emit('mouseover', event.data.originalEvent as MouseEvent));
    // nodeLabelGfx.on('mouseout', (event: InteractionEvent) => this.emit('mouseout', event.data.originalEvent as MouseEvent));
    // nodeLabelGfx.on('mousedown', (event: InteractionEvent) => this.emit('mousedown', event.data.originalEvent as MouseEvent));
    // nodeLabelGfx.on('mouseup', (event: InteractionEvent) => this.emit('mouseup', event.data.originalEvent as MouseEvent));
    // nodeLabelGfx.on('rightclick', (event: InteractionEvent) => this.emit('rightclick', event.data.originalEvent as MouseEvent));
    this.nodeStyle.label.show && createNodeLabel(nodeLabelGfx);
    return nodeLabelGfx;
  }

  createNodeContent() {
    const nodeContentGfx = new Container();
    nodeContentGfx.interactive = true;
    nodeContentGfx.buttonMode = true;
    nodeContentGfx.on('mousemove', (event: InteractionEvent) => this.emit('mousemove', event.data.originalEvent as MouseEvent));
    nodeContentGfx.on('mouseover', (event: InteractionEvent) => this.emit('mouseover', event.data.originalEvent as MouseEvent));
    nodeContentGfx.on('mouseout', (event: InteractionEvent) => this.emit('mouseout', event.data.originalEvent as MouseEvent));
    nodeContentGfx.on('mousedown', (event: InteractionEvent) => this.emit('mousedown', event.data.originalEvent as MouseEvent));
    nodeContentGfx.on('mouseup', (event: InteractionEvent) => this.emit('mouseup', event.data.originalEvent as MouseEvent));
    nodeContentGfx.on('rightclick', (event: InteractionEvent) => this.emit('rightclick', event.data.originalEvent as MouseEvent));
    this.nodeStyle.content.show && createNodeContent(nodeContentGfx, this.nodeStyle);
    return nodeContentGfx;
  }

  createNodeAttach() {
    const nodeAttachGfx = new Container();
    nodeAttachGfx.interactive = true;
    nodeAttachGfx.buttonMode = true;
    nodeAttachGfx.on('mousemove', (event: InteractionEvent) => this.emit('btnmousemove', event.data.originalEvent as MouseEvent));
    nodeAttachGfx.on('mouseover', (event: InteractionEvent) => this.emit('btnmouseover', event.data.originalEvent as MouseEvent));
    nodeAttachGfx.on('mouseout', (event: InteractionEvent) => this.emit('btnmouseout', event.data.originalEvent as MouseEvent));
    nodeAttachGfx.on('mousedown', (event: InteractionEvent) => this.emit('btnmousedown', event.data.originalEvent as MouseEvent));
    nodeAttachGfx.on('mouseup', (event: InteractionEvent) => this.emit('btnmouseup', event.data.originalEvent as MouseEvent));
    nodeAttachGfx.on('rightclick', (event: InteractionEvent) => this.emit('btnrightclick', event.data.originalEvent as MouseEvent));
    this.nodeStyle.attach.show && createNodeAttach(nodeAttachGfx);
    return nodeAttachGfx;
  }



  updatePosition(position: IPointData) {
    this.nodeGfx.position.copyFrom(position);
    this.nodeStyle.label.show && this.nodeLabelGfx.position.copyFrom(position);
    this.nodeStyle.content.show && this.nodeContentGfx.position.copyFrom(position);
    this.nodeStyle.attach.show && this.nodeAttachGfx.position.copyFrom(position);
  }



  updateStyle(nodeStyle: NodeStyle, textureCache: TextureCache) {
    updateNodeStyle(this.nodeGfx, nodeStyle, textureCache);
    nodeStyle.label.show && updateNodeLabelStyle(this.nodeLabelGfx, nodeStyle, textureCache);
    nodeStyle.content.show && updateNodeContentStyle(this.nodeContentGfx, nodeStyle, textureCache);
    nodeStyle.attach.show && updateNodeAttachStyle(this.nodeAttachGfx, nodeStyle, textureCache);
  }



  updateVisibility(zoomStep: number) {
    // updateNodeVisibility(this.nodeGfx, zoomStep);
    // updateNodeLabelVisibility(this.nodeLabelGfx, zoomStep);
    // updateNodeContentVisibility(this.nodeContentGfx, zoomStep);
    // updateNodeAttachVisibility(this.nodeAttachGfx, zoomStep);
  }


  // 单独直接设置node可见性
  nodeVisibility(visible: boolean) {
    this.nodeGfx.visible = visible;
    // this.nodeLabelGfx.visible = visible;
    this.nodeAttachGfx.visible = visible;
  }
  // 检查节点是否可见
  checkNodeVisibility() {
    return this.nodeGfx.visible; // 注意文字和附加容器的可见性
  }
}