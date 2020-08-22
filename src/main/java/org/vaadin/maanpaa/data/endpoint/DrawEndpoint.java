package org.vaadin.maanpaa.data.endpoint;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;

import org.vaadin.maanpaa.data.entity.DrawOperation;

import com.vaadin.flow.server.connect.Endpoint;
import com.vaadin.flow.server.connect.auth.AnonymousAllowed;

@Endpoint
@AnonymousAllowed
public class DrawEndpoint {

    private static Object lock = new Object();

    private static List<DrawOperation> ops = new ArrayList<>();

    public List<DrawOperation> update(List<DrawOperation> opsToAdd) {
        synchronized (lock) {
            ops.addAll(opsToAdd);
            cleanOps();
            return new ArrayList<>(ops);
        }
    }

    private void cleanOps() {
        Optional<Integer> lastStateSyncIndex = ops.stream()
                .filter(DrawOperation::isStateSync)
                .map(ops::indexOf)
                .max(Comparator.comparingInt(a -> a));

        lastStateSyncIndex.ifPresent(
                index -> ops = ops.subList(index, ops.size()));
    }

}
