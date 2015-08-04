/**
 * Created by buecher on 22/07/15.
 */

Cursor = function()
{
    this.html = document.getElementById('cursor');
    this.offset = this.html.offsetLeft;
    this.dragging = false;
    this.mouseOffsetOrigin = 0;

    this.html.addEventListener('mousedown', this.dragCursor.bind(this), false);
    document.addEventListener('mouseup', this.stopDragging.bind(this), false);
}

Cursor.prototype.stopDragging = function()
{
    this.dragging = false;
    document.removeEventListener('mousemove', this.moveCursor);
}

Cursor.prototype.dragCursor = function(e)
{
    var evtobj = window.event ? window.event : e;
    if ( evtobj.preventDefault )
    {
        evtobj.preventDefault();
    }

    this.offset = this.html.offsetLeft;

    this.dragging = true;

    this.mouseOffsetOrigin = evtobj.clientX;

    document.addEventListener('mousemove', this.moveCursor.bind(this), false);
}

Cursor.prototype.moveCursor = function(e)
{
    var evtobj = window.event ? window.event : e;

    if (this.dragging)
    {
        var newPosition = this.offset + evtobj.clientX - this.mouseOffsetOrigin;

        if ( newPosition >= -10 && newPosition <= document.getElementById('timeline').offsetWidth - 10)
        {
            this.setOffset(newPosition);
        }
    }
}

Cursor.prototype.setOffset = function(offset)
{
    this.html.style.left = offset + "px";
}

SnapshotManager = function()
{
    this.nbSnapshots = 0;
    this.snapshots = [];
    this.currentSnapshot = 'undefined';
    this.timeline = document.getElementById('timeline');
    this.cursor = new Cursor();
}

SnapshotManager.prototype.addSnapEventOnHTML = function(eventType, idHTML)
{
    document.getElementById(idHTML).addEventListener('click', this.addSnapshot.bind(this), false);
}

SnapshotManager.prototype.addSnapshot = function()
{
    var snapshot = new Snapshot(this.nbSnapshots);
    this.timeline.appendChild(snapshot.html);

    this.snapshots.push(snapshot);
    this.nbSnapshots = this.snapshots.length;

    this.replaceSnapshots();

    if (this.currentSnapshot !== 'undefined')
    {
        this.cursor.setOffset(this.snapshots[this.currentSnapshot].getOffset() - 10);
    }

    var that = this;

    snapshot.html.addEventListener('contextmenu', function(e) { that.removeSnapshot(e, snapshot); }, false);
    snapshot.html.addEventListener('click', function(e) { that.moveCursorOnSnapshot(e, snapshot); }, false);
}

SnapshotManager.prototype.replaceSnapshots = function()
{
    switch (this.nbSnapshots)
    {
        case 0:
            break;
        case 1:
            this.replaceSnapshot(0, 0);
            break;
        default:
            var step = 100 / (this.nbSnapshots - 1);
            for (var i = 0; i < this.nbSnapshots; i++)
            {
                this.replaceSnapshot(i, step);
            }
            break;
    }
}

SnapshotManager.prototype.replaceSnapshot = function(i, step)
{
    this.snapshots[i].setOffset(i*step + '%');
}

SnapshotManager.prototype.removeSnapshot = function(e, snap)
{
    evtobj = window.event ? window.event : e;
    if ( evtobj.preventDefault )
    {
        evtobj.preventDefault();
    }

    var id = snap.getIdNumber();
    this.timeline.removeChild(snap.html);

    for ( var i = id; i < this.nbSnapshots - 1; i++ )
    {
        this.snapshots[i] = this.snapshots[i+1];
        this.snapshots[i].setId(i);
    }

    this.snapshots.pop();

    this.nbSnapshots = this.snapshots.length;

    this.replaceSnapshots();

    if (this.currentSnapshot == id)
    {
        this.currentSnapshot = 'undefined';
    }
    else if (this.currentSnapshot > id)
    {
        this.currentSnapshot -= 1;
    }

    if (this.currentSnapshot !== 'undefined')
    {
        this.cursor.setOffset(this.snapshots[this.currentSnapshot].getOffset() - 10);
    }
}

SnapshotManager.prototype.moveCursorOnSnapshot = function(e, snap)
{
    this.cursor.setOffset(snap.getOffset() - 10);
    this.currentSnapshot = snap.getIdNumber();
}

Snapshot = function(id)
{
    this.html = document.createElement('li');
    this.html.className = 'snapshot';
    this.html.id = 'snap-'+id;
    var label = document.createElement('span');
    label.className = 'label-snapshot';
    var breakpoint = document.createElement('span');
    breakpoint.className = 'breakpoint';

    this.html.appendChild(label);
    this.html.appendChild(breakpoint);
}

Snapshot.prototype.getId = function()
{
    return this.html.id;
}

Snapshot.prototype.setId = function(id)
{
    this.html.id = 'snap-' + id;
}

Snapshot.prototype.getIdNumber = function()
{
    var result = -1;
    if ( !isNaN( parseInt( this.getId().substr( 5 ) ) ) )
    {
        result = parseInt( this.getId().substr( 5 ) );
    }
    return result;
}

Snapshot.prototype.getOffset = function()
{
    return this.html.offsetLeft;
}

Snapshot.prototype.setOffset = function(offset)
{
    this.html.style.left = offset;
}

var snapshotManager = new SnapshotManager();
snapshotManager.addSnapEventOnHTML('click', 'addSnap');