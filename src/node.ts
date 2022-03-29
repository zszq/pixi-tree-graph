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
  attachmousemove: (event: MouseEvent) => void;
  attachmouseover: (event: MouseEvent) => void;
  attachmouseout: (event: MouseEvent) => void;
  attachmousedown: (event: MouseEvent) => void;
  attachmouseup: (event: MouseEvent) => void;
  attachrightclick: (event: MouseEvent) => void;
}

export class PixiNode extends TypedEmitter<PixiNodeEvents> {
  nodeStyle: NodeStyle;
  nodeGfx: Container;
  nodeAttachGfx: Container;

  hovered: boolean = false;

  constructor(option: { nodeStyle: NodeStyle }) {
    super();

    this.nodeStyle = option.nodeStyle;
    this.nodeGfx = this.createNode();
    this.nodeAttachGfx = this.createNodeAttach();
  }

  private createNode() {
    const nodeGfx = new Container();
    // nodeGfx.filters = [new DropShadowFilter()]; // 加阴影性能开销太大
    nodeGfx.interactive = true;
    nodeGfx.buttonMode = true;
    nodeGfx.on('mousemove', (event: InteractionEvent) => this.emit('mousemove', event.data.originalEvent as MouseEvent));
    nodeGfx.on('mouseover', (event: InteractionEvent) => this.emit('mouseover', event.data.originalEvent as MouseEvent));
    nodeGfx.on('mouseout', (event: InteractionEvent) => this.emit('mouseout', event.data.originalEvent as MouseEvent));
    nodeGfx.on('mousedown', (event: InteractionEvent) => this.emit('mousedown', event.data.originalEvent as MouseEvent));
    nodeGfx.on('mouseup', (event: InteractionEvent) => this.emit('mouseup', event.data.originalEvent as MouseEvent));
    nodeGfx.on('rightclick', (event: InteractionEvent) => this.emit('rightclick', event.data.originalEvent as MouseEvent));
    !this.nodeStyle.content.show ? createNode(nodeGfx, this.nodeStyle) : createNodeContent(nodeGfx, this.nodeStyle);
    return nodeGfx;
  }

  createNodeAttach() {
    const nodeAttachGfx = new Container();
    nodeAttachGfx.interactive = true;
    nodeAttachGfx.buttonMode = true;
    nodeAttachGfx.on('mousemove', (event: InteractionEvent) => this.emit('attachmousemove', event.data.originalEvent as MouseEvent));
    nodeAttachGfx.on('mouseover', (event: InteractionEvent) => this.emit('attachmouseover', event.data.originalEvent as MouseEvent));
    nodeAttachGfx.on('mouseout', (event: InteractionEvent) => this.emit('attachmouseout', event.data.originalEvent as MouseEvent));
    nodeAttachGfx.on('mousedown', (event: InteractionEvent) => this.emit('attachmousedown', event.data.originalEvent as MouseEvent));
    nodeAttachGfx.on('mouseup', (event: InteractionEvent) => this.emit('attachmouseup', event.data.originalEvent as MouseEvent));
    nodeAttachGfx.on('rightclick', (event: InteractionEvent) => this.emit('attachrightclick', event.data.originalEvent as MouseEvent));
    this.nodeStyle.attach.show && createNodeAttach(nodeAttachGfx);
    return nodeAttachGfx;
  }

  updatePosition(position: IPointData) {
    this.nodeGfx.position.copyFrom(position);
    this.nodeStyle.attach.show && this.nodeAttachGfx.position.copyFrom(position);
  }

  updateStyle(nodeStyle: NodeStyle, textureCache: TextureCache) {
    !this.nodeStyle.content.show ? updateNodeStyle(this.nodeGfx, nodeStyle, textureCache) : updateNodeContentStyle(this.nodeGfx, nodeStyle, textureCache);
    // nodeStyle.label.show && updateNodeLabelStyle(this.nodeLabelGfx, nodeStyle, textureCache);
    nodeStyle.attach.show && updateNodeAttachStyle(this.nodeAttachGfx, nodeStyle, textureCache);
  }

  updateVisibility(zoomStep: number) {
    // !this.nodeStyle.content.show ? updateNodeVisibility(this.nodeGfx, zoomStep) : updateNodeContentVisibility(this.nodeGfx, zoomStep);
    // updateNodeAttachVisibility(this.nodeAttachGfx, zoomStep);
  }



  // 单独直接设置node可见性
  nodeVisibility(visible: boolean) {
    this.nodeGfx.visible = visible;
    this.nodeAttachGfx.visible = visible;
  }
  // 检查节点是否可见
  checkNodeVisibility() {
    return this.nodeGfx.visible; // 注意文字和附加容器的可见性
  }
}