package org.vaadin.maanpaa.data.endpoint;

import java.util.ArrayList;
import java.util.Collection;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

import org.vaadin.maanpaa.data.entity.CursorInfo;
import org.vaadin.maanpaa.data.entity.DrawOperation;

import com.vaadin.flow.server.connect.Endpoint;
import com.vaadin.flow.server.connect.auth.AnonymousAllowed;

@Endpoint
@AnonymousAllowed
public class DrawEndpoint {

    private static Object lock = new Object();

    private static List<DrawOperation> ops = new ArrayList<>();

    private static Map<String, CursorInfo> cursors = new ConcurrentHashMap<>();

    public List<DrawOperation> update(List<DrawOperation> opsToAdd, boolean firstCall) {
        synchronized (lock) {
            ops.addAll(opsToAdd);
            cleanOps();
            if (firstCall) {
                int startIndex = getLastStateSyncIndex().orElse(0);
                return ops.subList(startIndex, ops.size());
            } else {
                return ops.stream()
                        .filter(op -> !op.isStateSync())
                        .collect(Collectors.toList());
            }
        }
    }

    private void cleanOps() {
        Optional<Integer> lastStateSyncIndex = getLastStateSyncIndex();
        lastStateSyncIndex.map(ops::get).ifPresent(lastStateSync -> {
            ops = ops.stream()
                    .filter(op -> op == lastStateSync || !op.isStateSync())
                    .collect(Collectors.toList());
        });

        if (ops.size() < 100) {
            return;
        }

        getLastStateSyncIndex().ifPresent(
                index -> {
                    int startIndex = Math.min(50, index);
                    ops = ops.subList(startIndex, ops.size());
                });
    }

    private Optional<Integer> getLastStateSyncIndex() {
        return ops.stream()
                .filter(DrawOperation::isStateSync)
                .map(ops::indexOf)
                .max(Comparator.comparingInt(a -> a));
    }

    public Collection<CursorInfo> updateCursors(CursorInfo cursor) {
        if (cursor.getPosition() != null && cursor.getPosition().isPresent()) {
            cursors.put(cursor.getId(), cursor);
        } else {
            cursors.remove(cursor.getId());
        }
        return cursors.values();
    }

}
